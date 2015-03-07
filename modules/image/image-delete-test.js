var should = require('should');
var fs = require('fs');

var init = require('../base/init');
var error = require('../base/error');
var fs2 = require('../base/fs');
var config = require('../base/config')({ path: 'config/rapixel-test.json' });
var mongo = require('../mongo/mongo')({ dropDatabase: true });
var express2 = require('../main/express');
var upload = require('../upload/upload');
var userf = require('../user/user-fixture');
var imageb = require('../image/image-base');
var imaged = require('../image/image-delete');

var local = require('../main/local');

before(function (done) {
  init.run(done);
});

before(function (done) {
  fs2.removeDirs(imageb.imageDir, done);
});

var _f1 = 'samples/3840x2160-169.jpg';
var _id;
var _files;

describe("deleting", function () {
  before(function (done) {
    imageb.images.remove(done);
  });
  it("given user1 session", function (done) {
    userf.loginUser1(done);
  });
  it("and image", function (done) {
    local.post('/api/upload').attach('files', _f1).end(function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      should.not.exist(res.body.err);
      _files = res.body.files;
      done();
    });
  });
  it("and posted", function (done) {
    this.timeout(30000);
    var form = { files: _files, comment: 'image1' };
    local.post('/api/images').send(form).end(function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      should.not.exist(res.body.err);
      should.exist(res.body.ids);
      _id = res.body.ids[0];
      done();
    });
  });
  it("and deleted", function (done) {
    var dir = imageb.getImageDir(_id);
    var p = imageb.getVersionPath(dir, _id, 3840);
    fs.existsSync(p).should.true;
    local.del('/api/images/' + _id, function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      should.not.exist(res.body.err);
      fs.existsSync(p).should.false;
      done();
    });
  });
  it("version should not exist", function (done) {
    var dir = imageb.getImageDir(_id);
    var p = imageb.getVersionPath(dir, _id, 3840);
    fs.existsSync(p).should.false;
    imageb.images.findOne({ _id: _id }, function (err, image) {
      should.not.exist(err);
      should.not.exist(image);
      done();
    });
  });
});

describe("deleting by admin", function () {
  before(function (done) {
    imageb.images.remove(done);
  });
  it("given user1 session", function (done) {
    userf.loginUser1(done);
  });
  it("and image", function (done) {
    local.post('/api/upload').attach('files', _f1).end(function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      should.not.exist(res.body.err);
      _files = res.body.files;
      done();
    });
  });
  it("and posted", function (done) {
    this.timeout(30000);
    var form = { files: _files, comment: 'image1' };
    local.post('/api/images').send(form).end(function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      should.not.exist(res.body.err);
      should.exist(res.body.ids);
      _id = res.body.ids[0];
      done();
    });
  });
  it("and admin session", function (done) {
    userf.loginAdmin(done);
  });
  it("and deleted", function (done) {
    var dir = imageb.getImageDir(_id);
    var p = imageb.getVersionPath(dir, _id, 3840);
    fs.existsSync(p).should.true;
    local.del('/api/images/' + _id, function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      should.not.exist(res.body.err);
      done();
    });
  });
  it("version should not exist", function (done) {
    var dir = imageb.getImageDir(_id);
    var p = imageb.getVersionPath(dir, _id, 3840);
    fs.existsSync(p).should.false;
    imageb.images.findOne({ _id: _id }, function (err, image) {
      should.not.exist(err);
      should.not.exist(image);
      done();
    });
  });
});

describe("deleting other's image", function () {
  before(function (done) {
    imageb.images.remove(done);
  });
  it("given user1 session", function (done) {
    userf.loginUser1(done);
  });
  it("and image", function (done) {
    local.post('/api/upload').attach('files', _f1).end(function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      should.not.exist(res.body.err);
      _files = res.body.files;
      done();
    });
  });
  it("and posted", function (done) {
    this.timeout(30000);
    var form = { files: _files, comment: 'hello' };
    local.post('/api/images').send(form).end(function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      should.not.exist(res.body.err);
      should.exist(res.body.ids);
      _id = res.body.ids[0];
      done();
    });
  });
  it("and user2 session", function (done) {
    userf.loginUser2(done);
  });
  it("deleting should fail", function (done) {
    var dir = imageb.getImageDir(_id);
    var p = imageb.getVersionPath(dir, _id, 3840);
    fs.existsSync(p).should.true;
    local.del('/api/images/' + _id, function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      should.exist(res.body.err);
      error.find(res.body.err, error.NOT_AUTHORIZED).should.true;
      done();
    });
  });
  it("version should exist", function (done) {
    var dir = imageb.getImageDir(_id);
    var p = imageb.getVersionPath(dir, _id, 3840);
    fs.existsSync(p).should.true;
    imageb.images.findOne({ _id: _id }, function (err, image) {
      should.not.exist(err);
      should.exist(image);
      done();
    });
  });
});
