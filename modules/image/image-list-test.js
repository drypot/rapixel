var should = require('should');

var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config')({ path: 'config/rapixel-test.json' });
var mongo = require('../mongo/mongo')({ dropDatabase: true });
var express2 = require('../main/express');
var upload = require('../upload/upload');
var userf = require('../user/user-fixture');
var imageb = require('../image/image-base');
var imagel = require('../image/image-list');

before(function (done) {
  init.run(done);
});

before(function () {
  express2.listen();
});

before(function (done) {
  userf.loginUser1(done);
});

before(function (done) {
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

describe("counting", function () {
  it("should success", function (done) {
    imageb.images.count(function (err, c) {
      should.not.exist(err);
      c.should.equal(10);
      done();
    })
  });
});

describe("listing all", function () {
  it("should success", function (done) {
    var query = {
      ps: 99
    }
    express2.get('/api/images').query(query).end(function (err, res) {
      res.error.should.false;
      should.not.exist(res.body.err);
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
});

describe("listing page 1", function () {
  it("should success", function (done) {
    var query = {
      ps: 4
    };
    express2.get('/api/images').query(query).end(function (err, res) {
      res.error.should.false;
      should.not.exist(res.body.err);
      res.body.gt.should.equal(0);
      res.body.lt.should.equal(7);
      res.body.images.should.length(4);
      res.body.images[0]._id.should.equal(10);
      res.body.images[3]._id.should.equal(7);
      done();
    });
  });
});

describe("listing page 2 with lt", function () {
  it("should success", function (done) {
    var query = {
      lt:7, ps: 4
    }
    express2.get('/api/images').query(query).end(function (err, res) {
      res.error.should.false;
      should.not.exist(res.body.err);
      res.body.gt.should.equal(6);
      res.body.lt.should.equal(3);
      res.body.images.should.length(4);
      res.body.images[0]._id.should.equal(6);
      res.body.images[3]._id.should.equal(3);
      done();
    });
  });
});

describe("listing last page with lt", function () {
  it("should success", function (done) {
    var query = {
      lt: 3, ps: 4
    }
    express2.get('/api/images').query(query).end(function (err, res) {
      res.error.should.false;
      should.not.exist(res.body.err);
      res.body.gt.should.equal(2);
      res.body.lt.should.equal(0);
      res.body.images.should.length(2);
      res.body.images[0]._id.should.equal(2);
      res.body.images[1]._id.should.equal(1);
      done();
    });
  });
});


describe("listing page 2 with gt", function () {
  it("should success", function (done) {
    var query = {
      gt:2, ps: 4
    }
    express2.get('/api/images').query(query).end(function (err, res) {
      res.error.should.false;
      should.not.exist(res.body.err);
      res.body.gt.should.equal(6);
      res.body.lt.should.equal(3);
      res.body.images.should.length(4);
      res.body.images[0]._id.should.equal(6);
      res.body.images[3]._id.should.equal(3);
      done();
    });
  });
});

describe("listing page 1 with gt", function () {
  it("should success", function (done) {
    var query = {
      gt: 6, ps: 4
    };
    express2.get('/api/images').query(query).end(function (err, res) {
      res.error.should.false;
      should.not.exist(res.body.err);
      res.body.gt.should.equal(0);
      res.body.lt.should.equal(7);
      res.body.images.should.length(4);
      res.body.images[0]._id.should.equal(10);
      res.body.images[3]._id.should.equal(7);
      done();
    });
  });
});
