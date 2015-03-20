var chai = require('chai');
var expect = chai.expect;
chai.use(require('chai-http'));
chai.config.includeStack = true;

var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config')({ path: 'config/test.json' });
var mongo = require('../mongo/mongo')({ dropDatabase: true });
var express2 = require('../main/express');
var upload = require('../upload/upload');
var userf = require('../user/user-fixture');
var imageb = require('../image/image-base');
var imagel = require('../image/image-list');

var local = require('../main/local');

before(function (done) {
  init.run(done);
});

before(function (done) {
  userf.login('user1', done);
});

describe("preparing dummy", function (done) {
  it("given inserts", function (done) {
    var images = [];
    for (var i = 0; i < 10; i++) {
      var image = {
        _id: imageb.newId(),
        uid: userf.user1._id,
        cdate: new Date(),
        comment: '' + i
      };
      images.push(image);
    };
    imageb.images.insert(images, done);    
  });
  it("can be counted", function (done) {
    imageb.images.count(function (err, c) {
      expect(err).not.exist;
      c.should.equal(10);
      done();
    })
  });
});

describe("listing", function () {
  it("should success for big page", function (done) {
    var query = {
      ps: 99
    }
    local.get('/api/images').query(query).end(function (err, res) {
      expect(res.error).false;
      expect(res.body.err).not.exist;
      res.body.gt.should.equal(0);
      res.body.lt.should.equal(0);
      res.body.images.length.should.equal(10);
      res.body.images[0]._id.should.equal(10);
      res.body.images[1]._id.should.equal(9);
      res.body.images[2]._id.should.equal(8);
      res.body.images[9]._id.should.equal(1);
      done();
    });
  });
  it("should success for page 1", function (done) {
    var query = {
      ps: 4
    };
    local.get('/api/images').query(query).end(function (err, res) {
      expect(res.error).false;
      expect(res.body.err).not.exist;
      res.body.gt.should.equal(0);
      res.body.lt.should.equal(7);
      res.body.images.should.length(4);
      res.body.images[0]._id.should.equal(10);
      res.body.images[3]._id.should.equal(7);
      done();
    });
  });
  it("should success for page 2 with lt", function (done) {
    var query = {
      lt:7, ps: 4
    }
    local.get('/api/images').query(query).end(function (err, res) {
      expect(res.error).false;
      expect(res.body.err).not.exist;
      res.body.gt.should.equal(6);
      res.body.lt.should.equal(3);
      res.body.images.should.length(4);
      res.body.images[0]._id.should.equal(6);
      res.body.images[3]._id.should.equal(3);
      done();
    });
  });
  it("should success for last page with lt", function (done) {
    var query = {
      lt: 3, ps: 4
    }
    local.get('/api/images').query(query).end(function (err, res) {
      expect(res.error).false;
      expect(res.body.err).not.exist;
      res.body.gt.should.equal(2);
      res.body.lt.should.equal(0);
      res.body.images.should.length(2);
      res.body.images[0]._id.should.equal(2);
      res.body.images[1]._id.should.equal(1);
      done();
    });
  });
  it("should success for page 2 with gt", function (done) {
    var query = {
      gt:2, ps: 4
    }
    local.get('/api/images').query(query).end(function (err, res) {
      expect(res.error).false;
      expect(res.body.err).not.exist;
      res.body.gt.should.equal(6);
      res.body.lt.should.equal(3);
      res.body.images.should.length(4);
      res.body.images[0]._id.should.equal(6);
      res.body.images[3]._id.should.equal(3);
      done();
    });
  });
  it("should success for page 1 with gt", function (done) {
    var query = {
      gt: 6, ps: 4
    };
    local.get('/api/images').query(query).end(function (err, res) {
      expect(res.error).false;
      expect(res.body.err).not.exist;
      res.body.gt.should.equal(0);
      res.body.lt.should.equal(7);
      res.body.images.should.length(4);
      res.body.images[0]._id.should.equal(10);
      res.body.images[3]._id.should.equal(7);
      done();
    });
  });
});
