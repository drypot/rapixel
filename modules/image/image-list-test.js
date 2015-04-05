var chai = require('chai');
var expect = chai.expect;
chai.use(require('chai-http'));
chai.config.includeStack = true;

var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config')({ path: 'config/test.json' });
var mongo = require('../mongo/mongo')({ dropDatabase: true });
var exp = require('../express/express');
var upload = require('../express/upload');
var userf = require('../user/user-fixture');
var imageb = require('../image/image-base');
var imagel = require('../image/image-list');
var local = require('../express/local');

before(function (done) {
  init.run(done);
});

before(function (done) {
  userf.login('user1', done);
});

describe("preparing dummy", function (done) {
  var size = 10;
  it("should success", function (done) {
    var images = [];
    for (var i = 0; i < size; i++) {
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
      expect(c).equal(size);
      done();
    })
  });
});

describe("listing", function () {
  it("big page should success", function (done) {
    var query = {
      ps: 99
    }
    local.get('/api/images').query(query).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.gt).equal(0);
      expect(res.body.lt).equal(0);
      expect(res.body.images.length).equal(10);
      expect(res.body.images[0]._id).equal(10);
      expect(res.body.images[1]._id).equal(9);
      expect(res.body.images[2]._id).equal(8);
      expect(res.body.images[9]._id).equal(1);
      done();
    });
  });
  it("page 1 should success", function (done) {
    var query = {
      ps: 4
    };
    local.get('/api/images').query(query).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.gt).equal(0);
      expect(res.body.lt).equal(7);
      expect(res.body.images).length(4);
      expect(res.body.images[0]._id).equal(10);
      expect(res.body.images[3]._id).equal(7);
      done();
    });
  });
  it("page 2 with lt should success", function (done) {
    var query = {
      lt:7, ps: 4
    }
    local.get('/api/images').query(query).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.gt).equal(6);
      expect(res.body.lt).equal(3);
      expect(res.body.images).length(4);
      expect(res.body.images[0]._id).equal(6);
      expect(res.body.images[3]._id).equal(3);
      done();
    });
  });
  it("page with lt should success", function (done) {
    var query = {
      lt: 3, ps: 4
    }
    local.get('/api/images').query(query).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.gt).equal(2);
      expect(res.body.lt).equal(0);
      expect(res.body.images).length(2);
      expect(res.body.images[0]._id).equal(2);
      expect(res.body.images[1]._id).equal(1);
      done();
    });
  });
  it("page 2 with gt should success", function (done) {
    var query = {
      gt:2, ps: 4
    }
    local.get('/api/images').query(query).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.gt).equal(6);
      expect(res.body.lt).equal(3);
      expect(res.body.images).length(4);
      expect(res.body.images[0]._id).equal(6);
      expect(res.body.images[3]._id).equal(3);
      done();
    });
  });
  it("page 1 with gt should success", function (done) {
    var query = {
      gt: 6, ps: 4
    };
    local.get('/api/images').query(query).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.gt).equal(0);
      expect(res.body.lt).equal(7);
      expect(res.body.images).length(4);
      expect(res.body.images[0]._id).equal(10);
      expect(res.body.images[3]._id).equal(7);
      done();
    });
  });
});
