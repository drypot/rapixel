var should = require('should');
var fs = require('fs');

var init = require('../base/init');
var error = require('../error/error');
var fs2 = require('../fs/fs');
var config = require('../config/config')({ path: 'config/rapixel-test.json' });
var mongo = require('../mongo/mongo')({ dropDatabase: true });
var express = require('../express/express');
var upload = require('../upload/upload');
var userf = require('../user/user-fixture');
var imageb = require('../image/image-base');
var imaged = require('../image/image-delete');

before(function (done) {
  init.run(done);
});

before(function () {
  express.listen();
});

before(function (done) {
  fs2.removeDirs(imageb.imageDir, done);
});

var _f1 = 'samples/3840x2160-169.jpg';
var _id;
var _files;

describe("deleting image", function () {
  before(function (done) {
    imageb.images.remove(done);
  });
  it("given user1 session", function (done) {
    userf.loginUser1(done);
  });
  it("given tmp file", function (done) {
    express.post('/api/upload').attach('files', _f1).end(function (err, res) {
      should(!err);
      should(!res.error);
      should(!res.body.err);
      _files = res.body.files;
      done();
    });
  });
  it("given image", function (done) {
    this.timeout(30000);
    var form = { files: _files, comment: 'image1' };
    express.post('/api/images').send(form).end(function (err, res) {
      should(!err);
      should(!res.error);
      should(!res.body.err);
      should(res.body.ids);
      _id = res.body.ids[0];
      done();
    });
  });
  it("should success", function (done) {
    var dir = imageb.getImageDir(_id);
    var p = imageb.getVersionPath(dir, _id, 3840);
    fs.existsSync(p).should.true;
    express.del('/api/images/' + _id, function (err, res) {
      should(!err);
      should(!res.error);
      should(!res.body.err);
      fs.existsSync(p).should.false;
      done();
    });
  });
  it("can be checked", function (done) {
    var dir = imageb.getImageDir(_id);
    var p = imageb.getVersionPath(dir, _id, 3840);
    fs.existsSync(p).should.false;
    imageb.images.findOne({ _id: _id }, function (err, image) {
      should(!err);
      should(!image);
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
  it("given tmp file", function (done) {
    express.post('/api/upload').attach('files', _f1).end(function (err, res) {
      should(!err);
      should(!res.error);
      should(!res.body.err);
      _files = res.body.files;
      done();
    });
  });
  it("given image", function (done) {
    this.timeout(30000);
    var form = { files: _files, comment: 'image1' };
    express.post('/api/images').send(form).end(function (err, res) {
      should(!err);
      should(!res.error);
      should(!res.body.err);
      should(res.body.ids);
      _id = res.body.ids[0];
      done();
    });
  });
  it("given admin session", function (done) {
    userf.loginAdmin(done);
  });
  it("should success", function (done) {
    var dir = imageb.getImageDir(_id);
    var p = imageb.getVersionPath(dir, _id, 3840);
    fs.existsSync(p).should.true;
    express.del('/api/images/' + _id, function (err, res) {
      should(!err);
      should(!res.error);
      should(!res.body.err);
      done();
    });
  });
  it("can be checked", function (done) {
    var dir = imageb.getImageDir(_id);
    var p = imageb.getVersionPath(dir, _id, 3840);
    fs.existsSync(p).should.false;
    imageb.images.findOne({ _id: _id }, function (err, image) {
      should(!err);
      should(!image);
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
  it("given tmp file", function (done) {
    express.post('/api/upload').attach('files', _f1).end(function (err, res) {
      should(!err);
      should(!res.error);
      should(!res.body.err);
      _files = res.body.files;
      done();
    });
  });
  it("given image", function (done) {
    this.timeout(30000);
    var form = { files: _files, comment: 'hello' };
    express.post('/api/images').send(form).end(function (err, res) {
      should(!err);
      should(!res.error);
      should(!res.body.err);
      should(res.body.ids);
      _id = res.body.ids[0];
      done();
    });
  });
  it("given user2 session", function (done) {
    userf.loginUser2(done);
  });
  it("should fail", function (done) {
    var dir = imageb.getImageDir(_id);
    var p = imageb.getVersionPath(dir, _id, 3840);
    fs.existsSync(p).should.true;
    express.del('/api/images/' + _id, function (err, res) {
      should(!err);
      should(!res.error);
      should(res.body.err);
      should(error.find(res.body.err, error.NOT_AUTHORIZED));
      done();
    });
  });
  it("can be checked", function (done) {
    var dir = imageb.getImageDir(_id);
    var p = imageb.getVersionPath(dir, _id, 3840);
    fs.existsSync(p).should.true;
    imageb.images.findOne({ _id: _id }, function (err, image) {
      should(!err);
      should(image);
      done();
    });
  });
});
