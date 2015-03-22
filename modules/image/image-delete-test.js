var chai = require('chai');
var expect = chai.expect;
chai.use(require('chai-http'));
chai.config.includeStack = true;

var fs = require('fs');

var init = require('../base/init');
var error = require('../base/error');
var fsp = require('../base/fs');
var config = require('../base/config')({ path: 'config/test.json' });
var mongo = require('../mongo/mongo')({ dropDatabase: true });
var exp = require('../main/express');
var upload = require('../main/upload');
var userf = require('../user/user-fixture');
var imageb = require('../image/image-base');
var imaged = require('../image/image-delete');
var local = require('../main/local');

before(function (done) {
  init.run(done);
});

before(function (done) {
  fsp.removeDirs(imageb.imageDir, done);
});

var _f1 = 'samples/3840x2160-169.jpg';
var _id;

describe("deleting", function () {
  before(function (done) {
    imageb.images.remove(done);
  });
  it("given user1 login", function (done) {
    userf.login('user1', done);
  });
  it("given post", function (done) {
    this.timeout(30000);
    local.post('/api/images').field('comment', 'image1').attach('files', _f1).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.ids).exist;
      _id = res.body.ids[0];
      done();
    });
  });
  it("should success", function (done) {
    local.del('/api/images/' + _id, function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it("can be checked", function (done) {
    expect(fs.existsSync(new imageb.ImageDir(_id).getVersionPath(3840))).false;
    imageb.images.findOne({ _id: _id }, function (err, image) {
      expect(err).not.exist;
      expect(image).not.exist;
      done();
    });
  });
});

describe("deleting by admin", function () {
  before(function (done) {
    imageb.images.remove(done);
  });
  it("given user1 login", function (done) {
    userf.login('user1', done);
  });
  it("given post", function (done) {
    this.timeout(30000);
    local.post('/api/images').field('comment', 'image1').attach('files', _f1).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.ids).exist;
      _id = res.body.ids[0];
      done();
    });
  });
  it("given admin login", function (done) {
    userf.login('admin', done);
  });
  it("should success", function (done) {
    local.del('/api/images/' + _id, function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it("can be checked", function (done) {
    expect(fs.existsSync(new imageb.ImageDir(_id).getVersionPath(3840))).false;
    imageb.images.findOne({ _id: _id }, function (err, image) {
      expect(err).not.exist;
      expect(image).not.exist;
      done();
    });
  });
});

describe("deleting other's", function () {
  before(function (done) {
    imageb.images.remove(done);
  });
  it("given user1 login", function (done) {
    userf.login('user1', done);
  });
  it("given post", function (done) {
    this.timeout(30000);
    local.post('/api/images').field('comment', 'image1').attach('files', _f1).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.ids).exist;
      _id = res.body.ids[0];
      done();
    });
  });
 it("given user2 login", function (done) {
    userf.login('user2', done);
  });
  it("should fail", function (done) {
    local.del('/api/images/' + _id, function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      expect(error.find(res.body.err, error.NOT_AUTHORIZED)).true;
      done();
    });
  });
  it("can be checked", function (done) {
    expect(fs.existsSync(new imageb.ImageDir(_id).getVersionPath(3840))).true;
    imageb.images.findOne({ _id: _id }, function (err, image) {
      expect(err).not.exist;
      expect(image).exist;
      done();
    });
  });
});
