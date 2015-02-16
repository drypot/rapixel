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
var imagec = require('../image/image-create');

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

describe("posting 1 image", function () {
  var _files;
  var _ids;
  before(function (next) {
    imageb.images.remove(next);
  });
  it("given upload", function (next) {
    upload.upload('samples/3840x2160-169.jpg', function (err, files) {
      _files = files;
      next(err);
    });
  });
  it("should success", function (next) {
    this.timeout(30000);
    var form = { files: _files, comment: 'image1' };
    express.post('/api/images').send(form).end(function (err, res) {
      should(!err);
      should(!res.error);
      should(!res.body.err);
      should(res.body.ids);
      res.body.ids.length.should.equal(1);
      _ids = res.body.ids;
      next();
    });
  });
  it("can be checked", function (next) {
    var _id = _ids[0];
    imageb.images.findOne({ _id: _id }, function (err, image) {
      should(!err);
      image._id.should.equal(_id);
      image.uid.should.equal(userf.user1._id);
      image.fname.should.equal('3840x2160-169.jpg');
      image.format.should.equal('jpeg');
      image.width.should.equal(3840);
      image.vers.should.eql([ 3840, 2880, 2560, 2048, 1920, 1680, 1440, 1366, 1280, 1136, 1024, 960, 640 ]);
      should(image.cdate);
      image.comment.should.equal('image1');
      var dir = imageb.getImageDir(_id);
      fs.existsSync(imageb.getVersionPath(dir, _id, 5120)).should.be.false;
      fs.existsSync(imageb.getVersionPath(dir, _id, 3840)).should.be.true;
      fs.existsSync(imageb.getVersionPath(dir, _id, 1280)).should.be.true;
      fs.existsSync(imageb.getVersionPath(dir, _id, 640)).should.be.true;
      next();
    });
  });
});

describe("posting too many images", function () {
  var _files;
  before(function (next) {
    imageb.images.remove(next);
  }); 
  it("given max uploads", function (next) {
    upload.upload('samples/3840x2160-169.jpg', config.ticketMax, function (err, files) {
      _files = files;
      next(err);
    });
  });
  it("given max posts", function (next) {
    this.timeout(30000);
    var form = { files: _files };
    express.post('/api/images').send(form).end(function (err, res) {
      should(!err);
      should(!res.error);
      should(!res.body.err);
      should(res.body.ids);
      res.body.ids.should.length(config.ticketMax);
      next();
    });
  });
  it("given one more upload", function (next) {
    upload.upload('samples/3840x2160-169.jpg', function (err, files) {
      _files = files;
      next(err);
    });
  });
  it("should return empty ids", function (next) {
    this.timeout(30000);
    var form = { files: _files };
    express.post('/api/images').send(form).end(function (err, res) {
      should(!err);
      should(!res.error);
      should(!res.body.err);
      should(res.body.ids);
      res.body.ids.should.length(0);
      next();
    });
  });
});

describe("posting small", function () {
  var _files;
  before(function (next) {
    imageb.images.remove(next);
  });
  it("given upload", function (next) {
    upload.upload('samples/2880x1620-169.jpg', function (err, files) {
      _files = files;
      next(err);
    });
  });
  it("should fail", function (next) {
    var form = { files: _files };
    express.post('/api/images').send(form).end(function (err, res) {
      should(!err);
      should(!res.error);
      should(res.body.err);
      should(error.find(res.body.err, error.IMAGE_SIZE));
      next();
    });
  });
});

describe("posting text file", function () {
  var _files;
  before(function (next) {
    imageb.images.remove(next);
  }); 
  it("given upload", function (next) {
    upload.upload('lib/upload/fixture/f1.txt', function (err, files) {
      _files = files;
      next(err);
    });
  });
  it("should fail", function (next) {
    var form = { files: _files };
    express.post('/api/images').send(form).end(function (err, res) {
      should(!err);
      should(!res.error);
      should(res.body.err);
      should(error.find(res.body.err, error.IMAGE_TYPE));
      next();
    });
  });
});

describe("posting no file", function () {
  before(function (next) {
    imageb.images.remove(next);
  }); 
  it("should fail", function (next) {
    var form = { };
    express.post('/api/images').send(form).end(function (err, res) {
      should(!err);
      should(!res.error);
      should(res.body.err);
      should(error.find(res.body.err, error.IMAGE_NO_FILE));
      next();
    });
  });
});
