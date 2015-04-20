var fs = require('fs');

var init = require('../base/init');
var error = require('../base/error');
var fsp = require('../base/fs');
var config = require('../base/config')({ path: 'config/drypot-test.json' });
var mongop = require('../mongo/mongo')({ dropDatabase: true });
var exp = require('../express/express');
var upload = require('../express/upload');
var userf = require('../user/user-fixture');
var imageb = require('../image/image-base');
var imagen = require('../image/image-new');
var local = require('../express/local');
var expect = require('../base/assert').expect

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
    local.post('/api/images').field('comment', 'image1').attach('files', 'samples/svg-sample.svg').end(function (err, res) {
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
      expect(image.fname).equal('svg-sample.svg');
      expect(image.format).equal('svg');
      expect(image.width).not.exist;
      expect(image.vers).not.exist;
      expect(image.cdate).exist;
      expect(image.comment).equal('image1');
      expect(new imageb.FilePath(_id, 'svg').original).pathExist;
      done();
    });
  });
});

describe('posting max images', function () {
  before(function (done) {
    imageb.images.deleteMany(done);
  }); 
  it('should success', function (done) {
    this.timeout(30000);
    var post = local.post('/api/images');
    for (var i = 0; i < config.ticketMax; i++) {
      post.attach('files', 'samples/svg-sample.svg');
    }
    post.end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.ids).exist;
      expect(res.body.ids).length(config.ticketMax);
      done();
    });
  });
  it('one more should fail', function (done) {
    this.timeout(30000);
    local.post('/api/images').attach('files', 'samples/svg-sample.svg').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.ids).exist;
      expect(res.body.ids.length).equal(0);
      done();
    });
  });
});

describe('posting jpeg', function () {
  before(function (done) {
    imageb.images.deleteMany(done);
  });
  it('should fail', function (done) {
    this.timeout(30000);
    local.post('/api/images').attach('files', 'samples/1136x640-169.jpg').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      expect(res.body.err).error('IMAGE_TYPE');
      done();
    });
  });
});
