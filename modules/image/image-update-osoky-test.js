var chai = require('chai');
var expect = chai.expect;
chai.use(require('chai-http'));
chai.config.includeStack = true;

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
var imageu = require('../image/image-update');

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

describe("updating", function () {
  var _id;
  var _files;
  it("given image", function (done) {
    local.upload('samples/1280x720-169.jpg', function (err, files) {
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
      image.fname.should.equal('1280x720-169.jpg');
      image.format.should.equal('jpeg');
      image.width.should.equal(1280);
      image.vers.should.eql([ 720, 640 ]);
      should.exist(image.cdate);
      image.comment.should.equal('image1');
      var dir = imageb.getImageDir(_id);
      fs.existsSync(imageb.getVersionPath(dir, _id, 768)).should.be.false;
      fs.existsSync(imageb.getVersionPath(dir, _id, 720)).should.be.true;
      fs.existsSync(imageb.getVersionPath(dir, _id, 640)).should.be.true;
      done();
    });
  });
  it("given image 2", function (done) {
    local.upload('samples/1136x640-169.jpg', function (err, files) {
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
      image.fname.should.equal('1136x640-169.jpg');
      image.format.should.equal('jpeg');
      image.width.should.equal(1136);
      image.vers.should.eql([ 640 ]);
      should.exist(image.cdate);
      image.comment.should.equal('image2');
      var dir = imageb.getImageDir(_id);
      fs.existsSync(imageb.getVersionPath(dir, _id, 720)).should.be.false;
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
    local.upload('samples/640x360-169.jpg', function (err, files) {
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
