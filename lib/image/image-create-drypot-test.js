var should = require('should');
var fs = require('fs');

var init = require('../lang/init');
var error = require('../error/error');
var fs2 = require('../fs/fs');
var config = require('../config/config')({ path: 'config/drypot-test.json' });
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
    upload.upload('samples/svg-sample.svg', function (err, files) {
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
      image.fname.should.equal('svg-sample.svg');
      image.format.should.equal('svg');
      should(!image.width);
      should(!image.vers);
      should(image.cdate);
      image.comment.should.equal('image1');
      var dir = imageb.getImageDir(_id);
      fs.existsSync(imageb.getOriginalPath(dir, _id, 'svg')).should.be.true;
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
    upload.upload('samples/svg-sample.svg', config.ticketMax, function (err, files) {
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
    upload.upload('samples/svg-sample.svg', function (err, files) {
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

describe("posting jpeg", function () {
  var _files;
  before(function (next) {
    imageb.images.remove(next);
  });
  it("given upload", function (next) {
    upload.upload('samples/1136x640-169.jpg', function (err, files) {
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
