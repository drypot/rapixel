var fs = require('fs');

var init = require('../base/init');
var error = require('../base/error');
var fs2 = require('../base/fs2');
var config = require('../base/config')({ path: 'config/drypot-test.json' });
var mongob = require('../mongo/mongo-base')({ dropDatabase: true });
var expb = require('../express/express-base');
var expu = require('../express/express-upload');
var expl = require('../express/express-local');
var userf = require('../user/user-fixture');
var imageb = require('../image/image-base');
var imagen = require('../image/image-new');
var expect = require('../base/assert2').expect;

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
  it('should succeed', function (done) {
    this.timeout(30000);
    expl.post('/api/images').field('comment', 'image1').attach('files', 'samples/svg-sample.svg').end(function (err, res) {
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
  it('should succeed', function (done) {
    this.timeout(30000);
    var post = expl.post('/api/images');
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
    expl.post('/api/images').attach('files', 'samples/svg-sample.svg').end(function (err, res) {
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
    expl.post('/api/images').attach('files', 'samples/1136x640-169.jpg').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      expect(res.body.err).error('IMAGE_TYPE');
      done();
    });
  });
});
