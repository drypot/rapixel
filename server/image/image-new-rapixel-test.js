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
var imagen = require('../image/image-new');
var local = require('../express/local');
var expect = require('../base/assert').expect;

before(function (done) {
  init.run(done);
});

before(function (done) {
  userf.login('user1', done);
});

before(function (done) {
  imageb.emptyDir(done);
});

describe('posting one image', function () {
  var _id;
  before(function (done) {
    imageb.images.deleteMany(done);
  });
  it('should success', function (done) {
    this.timeout(30000);
    local.post('/api/images').field('comment', 'image1').attach('files', 'samples/3840x2160-169.jpg').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.ids).exist;
      expect(res.body.ids.length).equal(1);
      _id = res.body.ids[0];
      done();
    });
  });
  it('image should exist', function (done) {
    imageb.images.findOne({ _id: _id }, function (err, image) {
      expect(err).not.exist;
      expect(image._id).equal(_id);
      expect(image.uid).equal(userf.user1._id);
      expect(image.fname).equal('3840x2160-169.jpg');
      expect(image.format).equal('jpeg');
      expect(image.width).equal(3840);
      expect(image.vers).eql([ 3840, 2880, 2560, 2048, 1920, 1680, 1440, 1366, 1280, 1136, 1024, 960, 640 ]);
      expect(image.cdate).exist;
      expect(image.comment).equal('image1');
      var path = new imageb.FilePath(_id);
      expect(path.getVersion(5120)).not.pathExist;
      expect(path.getVersion(3840)).pathExist;
      expect(path.getVersion(1280)).pathExist;
      expect(path.getVersion(640)).pathExist;
      done();
    });
  });
});

describe('posting 4800 width image', function () {
  var _id;
  before(function (done) {
    imageb.images.deleteMany(done);
  });
  it('should success', function (done) {
    this.timeout(30000);
    local.post('/api/images').field('comment', 'image1').attach('files', 'samples/4800x2700-169.jpg').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.ids).exist;
      expect(res.body.ids.length).equal(1);
      _id = res.body.ids[0];
      done();
    });
  });
  it('image should exist', function (done) {
    imageb.images.findOne({ _id: _id }, function (err, image) {
      expect(err).not.exist;
      expect(image._id).equal(_id);
      expect(image.uid).equal(userf.user1._id);
      expect(image.fname).equal('4800x2700-169.jpg');
      expect(image.format).equal('jpeg');
      expect(image.width).equal(4800);
      expect(image.vers).eql([ 5120, 3840, 2880, 2560, 2048, 1920, 1680, 1440, 1366, 1280, 1136, 1024, 960, 640 ]);
      expect(image.cdate).exist;
      expect(image.comment).equal('image1');
      var path = new imageb.FilePath(_id);
      expect(path.getVersion(5120)).pathExist;
      expect(path.getVersion(3840)).pathExist;
      expect(path.getVersion(1280)).pathExist;
      expect(path.getVersion(640)).pathExist;
      done();
    });
  });
});

describe('posting max images', function () {
  var _ids;
  before(function (done) {
    imageb.images.deleteMany(done);
  }); 
  it('should success', function (done) {
    this.timeout(30000);
    var post = local.post('/api/images').field('comment', 'max images');
    for (var i = 0; i < config.ticketMax; i++) {
      post.attach('files', 'samples/3840x2160-169.jpg');
    }
    post.end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.ids).exist;
      expect(res.body.ids).length(config.ticketMax);
      _ids = res.body.ids;
      done();
    });
  });
  it('posting one more should fail', function (done) {
    this.timeout(30000);
    local.post('/api/images').attach('files', 'samples/3840x2160-169.jpg').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.ids).exist;
      expect(res.body.ids.length).equal(0);
      done();
    });
  });
});

describe('posting small image', function () {
  var _files;
  before(function (done) {
    imageb.images.deleteMany(done);
  }); 
  it('should fail', function (done) {
    this.timeout(30000);
    local.post('/api/images').attach('files', 'samples/2880x1620-169.jpg').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      expect(res.body.err).error('IMAGE_SIZE');
      done();
    });
  });
});
