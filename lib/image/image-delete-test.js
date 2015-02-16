var should = require('should');
var fs = require('fs');

var init = require('../lang/init');
var error = require('../error/error');
var fs2 = require('../fs/fs');
var config = require('../config/config')({ path: 'config/rapixel-test.json' });
var mongo = require('../mongo/mongo')({ dropDatabase: true });
var express = require('../express/express');
var upload = require('../upload/upload');
var userf = require('../user/user-fixture');
var imageb = require('../image/image-base');
var imaged = require('../image/image-delete');

before(function (next) {
  init.run(next);
});

before(function () {
  express.listen();
});

before(function (next) {
  fs2.removeDirs(imageb.imageDir, next);
});

var _f1 = 'samples/3840x2160-169.jpg';
var _id;
var _files;

describe("deleting image", function () {
  before(function (next) {
    imageb.images.remove(next);
  });
  it("given user1 session", function (next) {
    userf.loginUser1(next);
  });
  it("given tmp file", function (next) {
    express.post('/api/upload').attach('files', _f1).end(function (err, res) {
      should(!err);
      should(!res.error);
      should(!res.body.err);
      _files = res.body.files;
      next();
    });
  });
  it("given image", function (next) {
    this.timeout(30000);
    var form = { files: _files, comment: 'image1' };
    express.post('/api/images').send(form).end(function (err, res) {
      should(!err);
      should(!res.error);
      should(!res.body.err);
      should(res.body.ids);
      _id = res.body.ids[0];
      next();
    });
  });
  it("should success", function (next) {
    var dir = imageb.getImageDir(_id);
    var p = imageb.getVersionPath(dir, _id, 3840);
    fs.existsSync(p).should.true;
    express.del('/api/images/' + _id, function (err, res) {
      should(!err);
      should(!res.error);
      should(!res.body.err);
      fs.existsSync(p).should.false;
      next();
    });
  });
  it("can be checked", function (next) {
    var dir = imageb.getImageDir(_id);
    var p = imageb.getVersionPath(dir, _id, 3840);
    fs.existsSync(p).should.false;
    imageb.images.findOne({ _id: _id }, function (err, image) {
      should(!err);
      should(!image);
      next();
    });
  });
});

describe("deleting by admin", function () {
  before(function (next) {
    imageb.images.remove(next);
  });
  it("given user1 session", function (next) {
    userf.loginUser1(next);
  });
  it("given tmp file", function (next) {
    express.post('/api/upload').attach('files', _f1).end(function (err, res) {
      should(!err);
      should(!res.error);
      should(!res.body.err);
      _files = res.body.files;
      next();
    });
  });
  it("given image", function (next) {
    this.timeout(30000);
    var form = { files: _files, comment: 'image1' };
    express.post('/api/images').send(form).end(function (err, res) {
      should(!err);
      should(!res.error);
      should(!res.body.err);
      should(res.body.ids);
      _id = res.body.ids[0];
      next();
    });
  });
  it("given admin session", function (next) {
    userf.loginAdmin(next);
  });
  it("should success", function (next) {
    var dir = imageb.getImageDir(_id);
    var p = imageb.getVersionPath(dir, _id, 3840);
    fs.existsSync(p).should.true;
    express.del('/api/images/' + _id, function (err, res) {
      should(!err);
      should(!res.error);
      should(!res.body.err);
      next();
    });
  });
  it("can be checked", function (next) {
    var dir = imageb.getImageDir(_id);
    var p = imageb.getVersionPath(dir, _id, 3840);
    fs.existsSync(p).should.false;
    imageb.images.findOne({ _id: _id }, function (err, image) {
      should(!err);
      should(!image);
      next();
    });
  });
});

describe("deleting other's image", function () {
  before(function (next) {
    imageb.images.remove(next);
  });
  it("given user1 session", function (next) {
    userf.loginUser1(next);
  });
  it("given tmp file", function (next) {
    express.post('/api/upload').attach('files', _f1).end(function (err, res) {
      should(!err);
      should(!res.error);
      should(!res.body.err);
      _files = res.body.files;
      next();
    });
  });
  it("given image", function (next) {
    this.timeout(30000);
    var form = { files: _files, comment: 'hello' };
    express.post('/api/images').send(form).end(function (err, res) {
      should(!err);
      should(!res.error);
      should(!res.body.err);
      should(res.body.ids);
      _id = res.body.ids[0];
      next();
    });
  });
  it("given user2 session", function (next) {
    userf.loginUser2(next);
  });
  it("should fail", function (next) {
    var dir = imageb.getImageDir(_id);
    var p = imageb.getVersionPath(dir, _id, 3840);
    fs.existsSync(p).should.true;
    express.del('/api/images/' + _id, function (err, res) {
      should(!err);
      should(!res.error);
      should(res.body.err);
      should(error.find(res.body.err, error.NOT_AUTHORIZED));
      next();
    });
  });
  it("can be checked", function (next) {
    var dir = imageb.getImageDir(_id);
    var p = imageb.getVersionPath(dir, _id, 3840);
    fs.existsSync(p).should.true;
    imageb.images.findOne({ _id: _id }, function (err, image) {
      should(!err);
      should(image);
      next();
    });
  });
});
