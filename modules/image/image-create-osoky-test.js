var should = require('should');
var fs = require('fs');

var init = require('../base/init');
var error = require('../error/error');
var fs2 = require('../fs/fs');
var config = require('../config/config')({ path: 'config/osoky-test.json' });
var mongo = require('../mongo/mongo')({ dropDatabase: true });
var express = require('../express/express');
var upload = require('../upload/upload');
var userf = require('../user/user-fixture');
var imageb = require('../image/image-base');
var imagec = require('../image/image-create');

before(function (done) {
  init.run(done);
});

before(function () {
  express.listen();
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
    upload.upload('samples/1440x810-169.jpg', function (err, files) {
      _files = files;
      done(err);
    });
  });
  it("should success", function (done) {
    this.timeout(30000);
    var form = { files: _files, comment: 'image1' };
    express.post('/api/images').send(form).end(function (err, res) {
      should(!err);
      should(!res.error);
      should(!res.body.err);
      should(res.body.ids);
      _ids = res.body.ids;
      done();
    });
  });
  it("can be checked", function (done) {
    var _id = _ids[0];
    imageb.images.findOne({ _id: _id }, function (err, image) {
      should(!err);
      image._id.should.equal(_id);
      image.uid.should.equal(userf.user1._id);
      image.fname.should.equal('1440x810-169.jpg');
      image.format.should.equal('jpeg');
      image.vers.should.eql([ 800, 768, 720, 640 ]);
      should(image.cdate);
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

describe("posting 3 images", function () {
  var _files;
  var _ids;
  before(function (done) {
    imageb.images.remove(done);
  }); 
  it("given uploads", function (done) {
    upload.upload('samples/1280x720-169.jpg', 3, function (err, files) {
      _files = files;
      done(err);
    });
  });
  it("should success", function (done) {
    this.timeout(30000);
    var form = { files: _files, comment: 'image3' };
    express.post('/api/images').send(form).end(function (err, res) {
      should(!err);
      should(!res.error);
      should(!res.body.err);
      should(res.body.ids);
      res.body.ids.should.length(3);
      _ids = res.body.ids;
      done();
    });
  });
  it("can be checked 1", function (done) {
    var _id = _ids[0];
    imageb.images.findOne({ _id: _id }, function (err, image) {
      should(!err);
      image._id.should.equal(_id);
      image.uid.should.equal(userf.user1._id);
      image.fname.should.equal('1280x720-169.jpg');
      image.format.should.equal('jpeg');
      image.vers.should.eql([ 720, 640 ]);
      should(image.cdate);
      image.comment.should.equal('image3');
      var dir = imageb.getImageDir(_id);
      fs.existsSync(imageb.getVersionPath(dir, _id, 768)).should.be.false;
      fs.existsSync(imageb.getVersionPath(dir, _id, 720)).should.be.true;
      fs.existsSync(imageb.getVersionPath(dir, _id, 640)).should.be.true;
      done();
    });
  });
  it("can be check 3", function (done) {
    var _id = _ids[2];
    imageb.images.findOne({ _id: _id }, function (err, image) {
      should(!err);
      image._id.should.equal(_id);
      image.uid.should.equal(userf.user1._id);
      image.fname.should.equal('1280x720-169.jpg');
      image.format.should.equal('jpeg');
      image.vers.should.eql([ 720, 640 ]);
      should(image.cdate);
      image.comment.should.equal('image3');
      var dir = imageb.getImageDir(_id);
      fs.existsSync(imageb.getVersionPath(dir, _id, 768)).should.be.false;
      fs.existsSync(imageb.getVersionPath(dir, _id, 720)).should.be.true;
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
    upload.upload('samples/1136x640-169.jpg', config.ticketMax, function (err, files) {
      _files = files;
      done(err);
    });
  });
  it("given posts", function (done) {
    var form = { files: _files };
    express.post('/api/images').send(form).end(function (err, res) {
      should(!err);
      should(!res.error);
      should(!res.body.err);
      should(res.body.ids);
      res.body.ids.should.length(config.ticketMax);
      done();
    });
  });
  it("given one more upload", function (done) {
    upload.upload('samples/1136x640-169.jpg', function (err, files) {
      _files = files;
      done(err);
    });
  });
  it("should return empty ids", function (done) {
    var form = { files: _files };
    express.post('/api/images').send(form).end(function (err, res) {
      should(!err);
      should(!res.error);
      should(!res.body.err);
      should(res.body.ids);
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
    upload.upload('samples/640x360-169.jpg', function (err, files) {
      _files = files;
      done(err);
    });
  });
  it("should fail", function (done) {
    var form = { files: _files };
    express.post('/api/images').send(form).end(function (err, res) {
      should(!err);
      should(!res.error);
      should(res.body.err);
      should(error.find(res.body.err, error.IMAGE_SIZE));
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
    express.post('/api/images').send(form).end(function (err, res) {
      should(!err);
      should(!res.error);
      should(res.body.err);
      should(error.find(res.body.err, error.IMAGE_TYPE));
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
    express.post('/api/images').send(form).end(function (err, res) {
      should(!err);
      should(!res.error);
      should(res.body.err);
      should(error.find(res.body.err, error.IMAGE_NO_FILE));
      done();
    });
  });
});
