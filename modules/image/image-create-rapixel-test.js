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
var imagec = require('../image/image-create');

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
  fs2.emptyDir(imageb.imageDir, done);
});

describe("posting 1 image", function () {
  var _files;
  var _ids;
  before(function (done) {
    imageb.images.remove(done);
  });
  it("given upload", function (done) {
    upload.upload('samples/3840x2160-169.jpg', function (err, files) {
      _files = files;
      done(err);
    });
  });
  it("should success", function (done) {
    this.timeout(30000);
    var form = { files: _files, comment: 'image1' };
    express2.post('/api/images').send(form).end(function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      should.not.exist(res.body.err);
      should.exist(res.body.ids);
      res.body.ids.length.should.equal(1);
      _ids = res.body.ids;
      done();
    });
  });
  it("can be checked", function (done) {
    var _id = _ids[0];
    imageb.images.findOne({ _id: _id }, function (err, image) {
      should.not.exist(err);
      image._id.should.equal(_id);
      image.uid.should.equal(userf.user1._id);
      image.fname.should.equal('3840x2160-169.jpg');
      image.format.should.equal('jpeg');
      image.width.should.equal(3840);
      image.vers.should.eql([ 3840, 2880, 2560, 2048, 1920, 1680, 1440, 1366, 1280, 1136, 1024, 960, 640 ]);
      should.exist(image.cdate);
      image.comment.should.equal('image1');
      var dir = imageb.getImageDir(_id);
      fs.existsSync(imageb.getVersionPath(dir, _id, 5120)).should.be.false;
      fs.existsSync(imageb.getVersionPath(dir, _id, 3840)).should.be.true;
      fs.existsSync(imageb.getVersionPath(dir, _id, 1280)).should.be.true;
      fs.existsSync(imageb.getVersionPath(dir, _id, 640)).should.be.true;
      done();
    });
  });
});

describe("posting too many images", function () {
  var _files;
  before(function (done) {
    imageb.images.remove(done);
  }); 
  it("given max uploads", function (done) {
    upload.upload('samples/3840x2160-169.jpg', config.ticketMax, function (err, files) {
      _files = files;
      done(err);
    });
  });
  it("given max posts", function (done) {
    this.timeout(30000);
    var form = { files: _files };
    express2.post('/api/images').send(form).end(function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      should.not.exist(res.body.err);
      should.exist(res.body.ids);
      res.body.ids.should.length(config.ticketMax);
      done();
    });
  });
  it("given one more upload", function (done) {
    upload.upload('samples/3840x2160-169.jpg', function (err, files) {
      _files = files;
      done(err);
    });
  });
  it("should return empty ids", function (done) {
    this.timeout(30000);
    var form = { files: _files };
    express2.post('/api/images').send(form).end(function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      should.not.exist(res.body.err);
      should.exist(res.body.ids);
      res.body.ids.should.length(0);
      done();
    });
  });
});

describe("posting small", function () {
  var _files;
  before(function (done) {
    imageb.images.remove(done);
  });
  it("given upload", function (done) {
    upload.upload('samples/2880x1620-169.jpg', function (err, files) {
      _files = files;
      done(err);
    });
  });
  it("should fail", function (done) {
    var form = { files: _files };
    express2.post('/api/images').send(form).end(function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      should.exist(res.body.err);
      error.find(res.body.err, error.IMAGE_SIZE).should.true;
      done();
    });
  });
});

describe("posting text file", function () {
  var _files;
  before(function (done) {
    imageb.images.remove(done);
  }); 
  it("given upload", function (done) {
    upload.upload('modules/upload/fixture/f1.txt', function (err, files) {
      _files = files;
      done(err);
    });
  });
  it("should fail", function (done) {
    var form = { files: _files };
    express2.post('/api/images').send(form).end(function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      should.exist(res.body.err);
      error.find(res.body.err, error.IMAGE_TYPE).should.true;
      done();
    });
  });
});

describe("posting no file", function () {
  before(function (done) {
    imageb.images.remove(done);
  }); 
  it("should fail", function (done) {
    var form = { };
    express2.post('/api/images').send(form).end(function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      should.exist(res.body.err);
      error.find(res.body.err, error.IMAGE_NO_FILE).should.true;
      done();
    });
  });
});
