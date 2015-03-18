var should = require('should');
var fs = require('fs');

var init = require('../base/init');
var error = require('../base/error');
var fs2 = require('../base/fs');
var config = require('../base/config')({ path: 'config/osoky-test.json' });
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

before(function () {
  express2.app.listen();
});

before(function (done) {
  userf.loginUser1(done);
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
    local.upload('samples/1440x810-169.jpg', function (err, files) {
      _files = files;
      done(err);
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
      _ids = res.body.ids;
      done();
    });
  });
  it("versions should exist", function (done) {
    var _id = _ids[0];
    imageb.images.findOne({ _id: _id }, function (err, image) {
      should.not.exist(err);
      image._id.should.equal(_id);
      image.uid.should.equal(userf.user1._id);
      image.fname.should.equal('1440x810-169.jpg');
      image.format.should.equal('jpeg');
      image.vers.should.eql([ 800, 768, 720, 640 ]);
      should.exist(image.cdate);
      image.comment.should.equal('image1');
      var dir = imageb.getImageDir(_id);
      fs.existsSync(imageb.getVersionPath(dir, _id, 900)).should.be.false;
      fs.existsSync(imageb.getVersionPath(dir, _id, 800)).should.be.true;
      fs.existsSync(imageb.getVersionPath(dir, _id, 768)).should.be.true;
      fs.existsSync(imageb.getVersionPath(dir, _id, 720)).should.be.true;
      fs.existsSync(imageb.getVersionPath(dir, _id, 640)).should.be.true;
      done();
    });
  });
});

describe("posting", function () {
  var _files;
  var _ids;
  before(function (done) {
    imageb.images.remove(done);
  }); 
  it("given 3 images", function (done) {
    local.upload('samples/1280x720-169.jpg', 3, function (err, files) {
      _files = files;
      done(err);
    });
  });
  it("when posts new", function (done) {
    this.timeout(30000);
    var form = { files: _files, comment: 'image3' };
    local.post('/api/images').send(form).end(function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      should.not.exist(res.body.err);
      should.exist(res.body.ids);
      res.body.ids.should.length(3);
      _ids = res.body.ids;
      done();
    });
  });
  it("first versions should exist", function (done) {
    var _id = _ids[0];
    imageb.images.findOne({ _id: _id }, function (err, image) {
      should.not.exist(err);
      image._id.should.equal(_id);
      image.uid.should.equal(userf.user1._id);
      image.fname.should.equal('1280x720-169.jpg');
      image.format.should.equal('jpeg');
      image.vers.should.eql([ 720, 640 ]);
      should.exist(image.cdate);
      image.comment.should.equal('image3');
      var dir = imageb.getImageDir(_id);
      fs.existsSync(imageb.getVersionPath(dir, _id, 768)).should.be.false;
      fs.existsSync(imageb.getVersionPath(dir, _id, 720)).should.be.true;
      fs.existsSync(imageb.getVersionPath(dir, _id, 640)).should.be.true;
      done();
    });
  });
  it("third versions should exist", function (done) {
    var _id = _ids[2];
    imageb.images.findOne({ _id: _id }, function (err, image) {
      should.not.exist(err);
      image._id.should.equal(_id);
      image.uid.should.equal(userf.user1._id);
      image.fname.should.equal('1280x720-169.jpg');
      image.format.should.equal('jpeg');
      image.vers.should.eql([ 720, 640 ]);
      should.exist(image.cdate);
      image.comment.should.equal('image3');
      var dir = imageb.getImageDir(_id);
      fs.existsSync(imageb.getVersionPath(dir, _id, 768)).should.be.false;
      fs.existsSync(imageb.getVersionPath(dir, _id, 720)).should.be.true;
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
  it("given max uploads", function (done) {
    local.upload('samples/1136x640-169.jpg', config.ticketMax, function (err, files) {
      _files = files;
      done(err);
    });
  });
  it("and posted", function (done) {
    var form = { files: _files };
    local.post('/api/images').send(form).end(function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      should.not.exist(res.body.err);
      should.exist(res.body.ids);
      res.body.ids.should.length(config.ticketMax);
      done();
    });
  });
  it("and given one more", function (done) {
    local.upload('samples/1136x640-169.jpg', function (err, files) {
      _files = files;
      done(err);
    });
  });
  it("should receive empty ids", function (done) {
    var form = { files: _files };
    local.post('/api/images').send(form).end(function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      should.not.exist(res.body.err);
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
    local.upload('samples/640x360-169.jpg', function (err, files) {
      _files = files;
      done(err);
    });
  });
  it("should fail", function (done) {
    var form = { files: _files };
    local.post('/api/images').send(form).end(function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      should.exist(res.body.err);
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
      should.not.exist(err);
      res.error.should.false;
      should.exist(res.body.err);
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
      should.not.exist(err);
      res.error.should.false;
      should.exist(res.body.err);
      error.find(res.body.err, error.IMAGE_NO_FILE).should.true;
      done();
    });
  });
});
