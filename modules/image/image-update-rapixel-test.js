var should = require('should');
var fs = require('fs');

var init = require('../base/init');
var error = require('../base/error');
var fs2 = require('../fs/fs');
var config = require('../base/config')({ path: 'config/rapixel-test.json' });
var mongo = require('../mongo/mongo')({ dropDatabase: true });
var express2 = require('../main/express');
var upload = require('../upload/upload');
var userf = require('../user/user-fixture');
var imageb = require('../image/image-base');
var imageu = require('../image/image-update');

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

describe("updating", function () {
  var _id;
  var _files;
  it("given upload", function (done) {
    upload.upload('samples/5120x2880-169.jpg', function (err, files) {
      _files = files;
      done(err);
    });
  });
  it("given post", function (done) {
    this.timeout(30000);
    var form = { files: _files, comment: 'image1' };
    express2.post('/api/images').send(form).end(function (err, res) {
      should.not.exist(err);
      should.not.exist(res.error);
      should.not.exist(res.body.err);
      should.exist(res.body.ids);
      res.body.ids.length.should.equal(1);
      _id = res.body.ids[0];
      done();
    });
  });
  it("can be checked", function (done) {
    imageb.images.findOne({ _id: _id }, function (err, image) {
      should.not.exist(err);
      should.exist(image);
      image.fname.should.equal('5120x2880-169.jpg');
      image.format.should.equal('jpeg');
      image.width.should.equal(5120);
      image.vers.should.eql([ 5120, 3840, 2880, 2560, 2048, 1920, 1680, 1440, 1366, 1280, 1136, 1024, 960, 640 ]);
      should.exist(image.cdate);
      image.comment.should.equal('image1');
      var dir = imageb.getImageDir(_id);
      fs.existsSync(imageb.getVersionPath(dir, _id, 5120)).should.be.true;
      fs.existsSync(imageb.getVersionPath(dir, _id, 3840)).should.be.true;
      fs.existsSync(imageb.getVersionPath(dir, _id, 640)).should.be.true;
      done();
    });
  });
  it("given upload 2", function (done) {
    upload.upload('samples/3840x2160-169.jpg', function (err, files) {
      _files = files;
      done(err);
    });
  });
  it("should success", function (done) {
    this.timeout(30000);
    var form = { files: _files, comment: 'image2' };
    express2.put('/api/images/' + _id).send(form).end(function (err, res) {
      should.not.exist(err);
      should.not.exist(res.error);
      should.not.exist(res.body.err);
      done();
    });
  });
  it("can be checked", function (done) {
    imageb.images.findOne({ _id: _id }, function (err, image) {
      should.not.exist(err);
      should.exist(image);
      image.fname.should.equal('3840x2160-169.jpg');
      image.format.should.equal('jpeg');
      image.width.should.equal(3840);
      image.vers.should.eql([ 3840, 2880, 2560, 2048, 1920, 1680, 1440, 1366, 1280, 1136, 1024, 960, 640 ]);
      should.exist(image.cdate);
      image.comment.should.equal('image2');
      var dir = imageb.getImageDir(_id);
      fs.existsSync(imageb.getVersionPath(dir, _id, 5120)).should.be.false;
      fs.existsSync(imageb.getVersionPath(dir, _id, 3840)).should.be.true;
      fs.existsSync(imageb.getVersionPath(dir, _id, 1280)).should.be.true;
      fs.existsSync(imageb.getVersionPath(dir, _id, 640)).should.be.true;
      done();
    });
  });
});

describe("updating with no file", function () {
  var _id;
  it("given post", function (done) {
    var form = {
      _id: _id = imageb.newId(),
      uid: userf.user1._id
    };
    imageb.images.insert(form, done);
  });
  it("should success", function (done) {
    var form = { comment: 'updated with no file' };
    express2.put('/api/images/' + _id).send(form).end(function (err, res) {
      should.not.exist(err);
      should.not.exist(res.error);
      should.not.exist(res.body.err);
      done();
    });
  });
  it("can be checked", function (done) {
    imageb.images.findOne({ _id: _id }, function (err, image) {
      should.not.exist(err);
      should.exist(image);
      image.comment.should.equal('updated with no file');
      done();
    });
  });
});

describe("updating with small", function () {
  var _id;
  var _files;
  it("given post", function (done) {
    var form = {
      _id: _id = imageb.newId(),
      uid: userf.user1._id
    };
    imageb.images.insert(form, done);
  });
  it("given small upload", function (done) {
    upload.upload('samples/2880x1620-169.jpg', function (err, files) {
      _files = files;
      done(err);
    });
  });
  it("should fail", function (done) {
    var form = { files: _files };
    express2.put('/api/images/' + _id).send(form).end(function (err, res) {
      should.not.exist(err);
      should.not.exist(res.error);
      should.exist(res.body.err);
      error.find(res.body.err, error.IMAGE_SIZE).should.true;
      done();
    });
  });
});

describe("updating with text file", function () {
  var _id;
  var _files;
  it("given post", function (done) {
    var form = {
      _id: _id = imageb.newId(),
      uid: userf.user1._id
    };
    imageb.images.insert(form, done);
  });
  it("given text upload", function (done) {
    upload.upload('modules/upload/fixture/f1.txt', function (err, files) {
      _files = files;
      done(err);
    });
  });
  it("should fail", function (done) {
    var form = { files: _files };
    express2.put('/api/images/' + _id).send(form).end(function (err, res) {
      should.not.exist(err);
      should.not.exist(res.error);
      should.exist(res.body.err);
      error.find(res.body.err, error.IMAGE_TYPE).should.true;
      done();
    });
  });
});

describe("updating by others", function () {
  var _id;
  var _files;
  it("given post", function (done) {
    var form = {
      _id: _id = imageb.newId(),
      uid: userf.user1._id
    };
    imageb.images.insert(form, done);
  });
  it("given user2 login", function (done) {
    userf.loginUser2(done);
  });
  it("should fail", function (done) {
    var form = { comment: 'xxxx' };
    express2.put('/api/images/' + _id).send(form).end(function (err, res) {
      should.not.exist(err);
      should.not.exist(res.error);
      should.exist(res.body.err);
      error.find(res.body.err, error.NOT_AUTHORIZED).should.true;
      done();
    });
  });
});
