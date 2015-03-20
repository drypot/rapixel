var chai = require('chai');
var expect = chai.expect;
chai.use(require('chai-http'));
chai.config.includeStack = true;

var fs = require('fs');

var init = require('../base/init');
var error = require('../base/error');
var fs2 = require('../base/fs');
var config = require('../base/config')({ path: 'config/test.json' });
var mongo = require('../mongo/mongo')({ dropDatabase: true });
var express2 = require('../main/express');
var upload = require('../upload/upload');
var userf = require('../user/user-fixture');
var imageb = require('../image/image-base');
var imagec = require('../image/image-create');

var local = require('../main/local');

before(function (done) {
  init.run(done);
});

before(function (done) {
  userf.login('user1', done);
});

before(function (done) {
  fs2.emptyDir(imageb.imageDir, done);
});

describe("posting", function () {
  var _files;
  var _ids;
  before(function (done) {
    imageb.images.remove(done);
  });
  it("given one image", function (done) {
    local.upload('samples/3840x2160-169.jpg', function (err, files) {
      _files = files;
      done(err);
    });
  });
  it("and posted", function (done) {
    this.timeout(30000);
    var form = { files: _files, comment: 'image1' };
    local.post('/api/images').send(form).end(function (err, res) {
      expect(err).not.exist;
      expect(res.error).false;
      expect(res.body.err).not.exist;
      should.exist(res.body.ids);
      res.body.ids.length.should.equal(1);
      _ids = res.body.ids;
      done();
    });
  });
  it("versions should exist", function (done) {
    var _id = _ids[0];
    imageb.images.findOne({ _id: _id }, function (err, image) {
      expect(err).not.exist;
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

describe("posting", function () {
  var _files;
  before(function (done) {
    imageb.images.remove(done);
  }); 
  it("given max images", function (done) {
    local.upload('samples/3840x2160-169.jpg', config.ticketMax, function (err, files) {
      _files = files;
      done(err);
    });
  });
  it("and posted", function (done) {
    this.timeout(30000);
    var form = { files: _files };
    local.post('/api/images').send(form).end(function (err, res) {
      expect(err).not.exist;
      expect(res.error).false;
      expect(res.body.err).not.exist;
      should.exist(res.body.ids);
      res.body.ids.should.length(config.ticketMax);
      done();
    });
  });
  it("and given one more", function (done) {
    local.upload('samples/3840x2160-169.jpg', function (err, files) {
      _files = files;
      done(err);
    });
  });
  it("should recive empty ids", function (done) {
    this.timeout(30000);
    var form = { files: _files };
    local.post('/api/images').send(form).end(function (err, res) {
      expect(err).not.exist;
      expect(res.error).false;
      expect(res.body.err).not.exist;
      should.exist(res.body.ids);
      res.body.ids.should.length(0);
      done();
    });
  });
});

describe("posting", function () {
  var _files;
  before(function (done) {
    imageb.images.remove(done);
  });
  it("given small image", function (done) {
    local.upload('samples/2880x1620-169.jpg', function (err, files) {
      _files = files;
      done(err);
    });
  });
  it("should fail", function (done) {
    var form = { files: _files };
    local.post('/api/images').send(form).end(function (err, res) {
      expect(err).not.exist;
      expect(res.error).false;
      expect(res.body.err).exist;
      error.find(res.body.err, error.IMAGE_SIZE).should.true;
      done();
    });
  });
});

describe("posting", function () {
  var _files;
  before(function (done) {
    imageb.images.remove(done);
  }); 
  it("given text file", function (done) {
    local.upload('modules/main/upload-fixture1.txt', function (err, files) {
      _files = files;
      done(err);
    });
  });
  it("should fail", function (done) {
    var form = { files: _files };
    local.post('/api/images').send(form).end(function (err, res) {
      expect(err).not.exist;
      expect(res.error).false;
      expect(res.body.err).exist;
      error.find(res.body.err, error.IMAGE_TYPE).should.true;
      done();
    });
  });
});

describe("posting with no file", function () {
  before(function (done) {
    imageb.images.remove(done);
  }); 
  it("should fail", function (done) {
    var form = { };
    local.post('/api/images').send(form).end(function (err, res) {
      expect(err).not.exist;
      expect(res.error).false;
      expect(res.body.err).exist;
      error.find(res.body.err, error.IMAGE_NO_FILE).should.true;
      done();
    });
  });
});
