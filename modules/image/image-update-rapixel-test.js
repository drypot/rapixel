var chai = require('chai');
var expect = chai.expect;
chai.use(require('chai-http'));
chai.config.includeStack = true;

var fs = require('fs');

var init = require('../base/init');
var error = require('../base/error');
var fsp = require('../base/fs');
var config = require('../base/config')({ path: 'config/test.json' });
var mongo = require('../mongo/mongo')({ dropDatabase: true });
var exp = require('../main/express');
var upload = require('../upload/upload');
var userf = require('../user/user-fixture');
var imageb = require('../image/image-base');
var imageu = require('../image/image-update');

var local = require('../main/local');

before(function (done) {
  init.run(done);
});

before(function (done) {
  userf.login('user1', done);
});

before(function (done) {
  fsp.emptyDir(imageb.imageDir, done);
});

describe("updating", function () {
  var _id;
  var _files;
  it("given image", function (done) {
    local.upload('samples/5120x2880-169.jpg', function (err, files) {
      _files = files;
      done(err);
    });
  });
  it("and posted", function (done) {
    this.timeout(30000);
    var form = { files: _files, comment: 'image1' };
    local.post('/api/images').send(form).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      should.exist(res.body.ids);
      res.body.ids.length.should.equal(1);
      _id = res.body.ids[0];
      done();
    });
  });
  it("versions should exist", function (done) {
    imageb.images.findOne({ _id: _id }, function (err, image) {
      expect(err).not.exist;
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
  it("given image 2", function (done) {
    local.upload('samples/3840x2160-169.jpg', function (err, files) {
      _files = files;
      done(err);
    });
  });
  it("and updated", function (done) {
    this.timeout(30000);
    var form = { files: _files, comment: 'image2' };
    local.put('/api/images/' + _id).send(form).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it("versions should have been modified", function (done) {
    imageb.images.findOne({ _id: _id }, function (err, image) {
      expect(err).not.exist;
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

describe("updating", function () {
  var _id;
  it("given post with no file", function (done) {
    var form = {
      _id: _id = imageb.newId(),
      uid: userf.user1._id
    };
    imageb.images.insert(form, done);
  });
  it("and updated", function (done) {
    var form = { comment: 'updated with no file' };
    local.put('/api/images/' + _id).send(form).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it("post should have been modifed", function (done) {
    imageb.images.findOne({ _id: _id }, function (err, image) {
      expect(err).not.exist;
      should.exist(image);
      image.comment.should.equal('updated with no file');
      done();
    });
  });
});

describe("updating", function () {
  var _id;
  var _files;
  it("given post", function (done) {
    var form = {
      _id: _id = imageb.newId(),
      uid: userf.user1._id
    };
    imageb.images.insert(form, done);
  });
  it("and small new image", function (done) {
    local.upload('samples/2880x1620-169.jpg', function (err, files) {
      _files = files;
      done(err);
    });
  });
  it("should fail", function (done) {
    var form = { files: _files };
    local.put('/api/images/' + _id).send(form).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      error.find(res.body.err, error.IMAGE_SIZE).should.true;
      done();
    });
  });
});

describe("updating", function () {
  var _id;
  var _files;
  it("given post", function (done) {
    var form = {
      _id: _id = imageb.newId(),
      uid: userf.user1._id
    };
    imageb.images.insert(form, done);
  });
  it("and new text file", function (done) {
    local.upload('modules/main/upload-fixture1.txt', function (err, files) {
      _files = files;
      done(err);
    });
  });
  it("should fail", function (done) {
    var form = { files: _files };
    local.put('/api/images/' + _id).send(form).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      error.find(res.body.err, error.IMAGE_TYPE).should.true;
      done();
    });
  });
});

describe("updating", function () {
  var _id;
  var _files;
  it("given post", function (done) {
    var form = {
      _id: _id = imageb.newId(),
      uid: userf.user1._id
    };
    imageb.images.insert(form, done);
  });
  it("and user2 login", function (done) {
    userf.login('user2', done);
  });
  it("should fail", function (done) {
    var form = { comment: 'xxxx' };
    local.put('/api/images/' + _id).send(form).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      error.find(res.body.err, error.NOT_AUTHORIZED).should.true;
      done();
    });
  });
});
