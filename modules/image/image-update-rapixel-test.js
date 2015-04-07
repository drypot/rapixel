var chai = require('chai');
var expect = chai.expect;
chai.use(require('chai-http'));
chai.config.includeStack = true;

var fs = require('fs');

var init = require('../base/init');
var error = require('../base/error');
var fsp = require('../base/fs');
var config = require('../base/config')({ path: 'config/test.json' });
var mongop = require('../mongo/mongo')({ dropDatabase: true });
var exp = require('../express/express');
var upload = require('../express/upload');
var userf = require('../user/user-fixture');
var imageb = require('../image/image-base');
var imageu = require('../image/image-update');
var local = require('../express/local');

before(function (done) {
  init.run(done);
});

before(function (done) {
  userf.login('user1', done);
});

before(function (done) {
  fsp.emptyDir(imageb.imageDir, done);
});

describe("updating with image", function () {
  var _id;
  it("given post", function (done) {
    this.timeout(30000);
    local.post('/api/images').field('comment', 'image1').attach('files', 'samples/5120x2880-169.jpg').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.ids).exist;
      expect(res.body.ids.length).equal(1);
      _id = res.body.ids[0];
      done();
    });
  });
  it("can be checked", function (done) {
    imageb.images.findOne({ _id: _id }, function (err, image) {
      expect(err).not.exist;
      expect(image).exist;
      expect(image.fname).equal('5120x2880-169.jpg');
      expect(image.format).equal('jpeg');
      expect(image.width).equal(5120);
      expect(image.vers).eql([ 5120, 3840, 2880, 2560, 2048, 1920, 1680, 1440, 1366, 1280, 1136, 1024, 960, 640 ]);
      expect(image.cdate).exist;
      expect(image.comment).equal('image1');
      var dir = new imageb.ImageDir(_id);
      expect(fs.existsSync(dir.getVersionPath(5120))).be.true;
      expect(fs.existsSync(dir.getVersionPath(3840))).be.true;
      expect(fs.existsSync(dir.getVersionPath(640))).be.true;
      done();
    });
  });
  it("should success", function (done) {
    this.timeout(30000);
    local.put('/api/images/' + _id).field('comment', 'image2').attach('files', 'samples/3840x2160-169.jpg').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it("can be checked", function (done) {
    imageb.images.findOne({ _id: _id }, function (err, image) {
      expect(err).not.exist;
      expect(image).exist;
      expect(image.fname).equal('3840x2160-169.jpg');
      expect(image.format).equal('jpeg');
      expect(image.width).equal(3840);
      expect(image.vers).eql([ 3840, 2880, 2560, 2048, 1920, 1680, 1440, 1366, 1280, 1136, 1024, 960, 640 ]);
      expect(image.cdate).exist;
      expect(image.comment).equal('image2');
      var dir = new imageb.ImageDir(_id);
      expect(fs.existsSync(dir.getVersionPath(5120))).be.false;
      expect(fs.existsSync(dir.getVersionPath(3840))).be.true;
      expect(fs.existsSync(dir.getVersionPath(1280))).be.true;
      expect(fs.existsSync(dir.getVersionPath(640))).be.true;
      done();
    });
  });
});

describe("updating with small image", function () {
  var _id;
  it("given post", function (done) {
    var form = {
      _id: _id = imageb.newId(),
      uid: userf.user1._id
    };
    imageb.images.insert(form, done);
  });
  it("should fail", function (done) {
    local.put('/api/images/' + _id).attach('files', 'samples/2880x1620-169.jpg').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      expect(error.find(res.body.err, error.IMAGE_SIZE)).true;
      done();
    });
  });
});
