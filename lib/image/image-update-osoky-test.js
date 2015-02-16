var should = require('should');
var fs = require('fs');

var init = require('../lang/init');
var error = require('../error/error');
var fs2 = require('../fs/fs');
var config = require('../config/config')({ path: 'config/osoky-test.json' });
var mongo = require('../mongo/mongo')({ dropDatabase: true });
var express = require('../express/express');
var upload = require('../upload/upload');
var userf = require('../user/user-fixture');
var imageb = require('../image/image-base');
var imageu = require('../image/image-update');

before(function (next) {
  init.run(next);
});

before(function () {
  express.listen();
});

before(function (next) {
  userf.loginUser1(next);
});

before(function (next) {
  fs2.emptyDir(imageb.imageDir, next);
});

describe("updating", function () {
  var _id;
  var _files;
  it("given upload", function (next) {
    upload.upload('samples/1280x720-169.jpg', function (err, files) {
      _files = files;
      next(err);
    });
  });
  it("given post", function (next) {
    this.timeout(30000);
    var form = { files: _files, comment: 'image1' };
    express.post('/api/images').send(form).end(function (err, res) {
      should(!err);
      should(!res.error);
      should(!res.body.err);
      should(res.body.ids);
      res.body.ids.length.should.equal(1);
      _id = res.body.ids[0];
      next();
    });
  });
  it("can be checked", function (next) {
    imageb.images.findOne({ _id: _id }, function (err, image) {
      should(!err);
      should(image);
      image.fname.should.equal('1280x720-169.jpg');
      image.format.should.equal('jpeg');
      image.width.should.equal(1280);
      image.vers.should.eql([ 720, 640 ]);
      should(image.cdate);
      image.comment.should.equal('image1');
      var dir = imageb.getImageDir(_id);
      fs.existsSync(imageb.getVersionPath(dir, _id, 768)).should.be.false;
      fs.existsSync(imageb.getVersionPath(dir, _id, 720)).should.be.true;
      fs.existsSync(imageb.getVersionPath(dir, _id, 640)).should.be.true;
      next();
    });
  });
  it("given upload 2", function (next) {
    upload.upload('samples/1136x640-169.jpg', function (err, files) {
      _files = files;
      next(err);
    });
  });
  it("should success", function (next) {
    this.timeout(30000);
    var form = { files: _files, comment: 'image2' };
    express.put('/api/images/' + _id).send(form).end(function (err, res) {
      should(!err);
      should(!res.error);
      should(!res.body.err);
      next();
    });
  });
  it("can be checked", function (next) {
    imageb.images.findOne({ _id: _id }, function (err, image) {
      should(!err);
      should(image);
      image.fname.should.equal('1136x640-169.jpg');
      image.format.should.equal('jpeg');
      image.width.should.equal(1136);
      image.vers.should.eql([ 640 ]);
      should(image.cdate);
      image.comment.should.equal('image2');
      var dir = imageb.getImageDir(_id);
      fs.existsSync(imageb.getVersionPath(dir, _id, 720)).should.be.false;
      fs.existsSync(imageb.getVersionPath(dir, _id, 640)).should.be.true;
      next();
    });
  });
});

describe("updating with no file", function () {
  var _id;
  it("given post", function (next) {
    var form = {
      _id: _id = imageb.newId(),
      uid: userf.user1._id
    };
    imageb.images.insert(form, next);
  });
  it("should success", function (next) {
    var form = { comment: 'updated with no file' };
    express.put('/api/images/' + _id).send(form).end(function (err, res) {
      should(!err);
      should(!res.error);
      should(!res.body.err);
      next();
    });
  });
  it("can be checked", function (next) {
    imageb.images.findOne({ _id: _id }, function (err, image) {
      should(!err);
      should(image);
      image.comment.should.equal('updated with no file');
      next();
    });
  });
});

describe("updating with small", function () {
  var _id;
  var _files;
  it("given post", function (next) {
    var form = {
      _id: _id = imageb.newId(),
      uid: userf.user1._id
    };
    imageb.images.insert(form, next);
  });
  it("given small upload", function (next) {
    upload.upload('samples/640x360-169.jpg', function (err, files) {
      _files = files;
      next(err);
    });
  });
  it("should fail", function (next) {
    var form = { files: _files };
    express.put('/api/images/' + _id).send(form).end(function (err, res) {
      should(!err);
      should(!res.error);
      should(res.body.err);
      should(error.find(res.body.err, error.IMAGE_SIZE));
      next();
    });
  });
});

describe("updating with text file", function () {
  var _id;
  var _files;
  it("given post", function (next) {
    var form = {
      _id: _id = imageb.newId(),
      uid: userf.user1._id
    };
    imageb.images.insert(form, next);
  });
  it("given text upload", function (next) {
    upload.upload('lib/upload/fixture/f1.txt', function (err, files) {
      _files = files;
      next(err);
    });
  });
  it("should fail", function (next) {
    var form = { files: _files };
    express.put('/api/images/' + _id).send(form).end(function (err, res) {
      should(!err);
      should(!res.error);
      should(res.body.err);
      should(error.find(res.body.err, error.IMAGE_TYPE));
      next();
    });
  });
});

describe("updating by others", function () {
  var _id;
  var _files;
  it("given post", function (next) {
    var form = {
      _id: _id = imageb.newId(),
      uid: userf.user1._id
    };
    imageb.images.insert(form, next);
  });
  it("given user2 login", function (next) {
    userf.loginUser2(next);
  });
  it("should fail", function (next) {
    var form = { comment: 'xxxx' };
    express.put('/api/images/' + _id).send(form).end(function (err, res) {
      should(!err);
      should(!res.error);
      should(res.body.err);
      should(error.find(res.body.err, error.NOT_AUTHORIZED));
      next();
    });
  });
});
