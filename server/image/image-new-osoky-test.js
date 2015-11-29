var fs = require('fs');

var init = require('../base/init');
var error = require('../base/error');
var fs2 = require('../base/fs2');
var config = require('../base/config')({ path: 'config/osoky-test.json' });
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
    expl.post('/api/images').field('comment', 'image1').attach('files', 'samples/1440x810.jpg').end(function (err, res) {
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
      expect(image.fname).equal('1440x810.jpg');
      expect(image.format).equal('jpeg');
      expect(image.vers).eql([ 800, 768, 720, 640 ]);
      expect(image.cdate).exist;
      expect(image.comment).equal('image1');
      var dir = new imageb.Image(_id);
      expect(dir.getPath(900)).not.pathExist;
      expect(dir.getPath(800)).pathExist;
      expect(dir.getPath(768)).pathExist;
      expect(dir.getPath(720)).pathExist;
      expect(dir.getPath(640)).pathExist;
      done();
    });
  });
});

describe('posting max images', function () {
  var _ids;
  before(function (done) {
    imageb.images.deleteMany(done);
  }); 
  it('should succeed', function (done) {
    this.timeout(30000);
    var post = expl.post('/api/images').field('comment', 'max images');
    for (var i = 0; i < config.ticketMax; i++) {
      post.attach('files', 'samples/1280x720.jpg');
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
  it('first versions should exist', function (done) {
    var _id = _ids[0];
    imageb.images.findOne({ _id: _id }, function (err, image) {
      expect(err).not.exist;
      expect(image._id).equal(_id);
      expect(image.uid).equal(userf.user1._id);
      expect(image.fname).equal('1280x720.jpg');
      expect(image.format).equal('jpeg');
      expect(image.vers).eql([ 720, 640 ]);
      expect(image.cdate).exist;
      expect(image.comment).equal('max images');
      var path = new imageb.Image(_id);
      expect(path.getPath(768)).not.pathExist;
      expect(path.getPath(720)).pathExist;
      expect(path.getPath(640)).pathExist;
      done();
    });
  });
  it('third versions should exist', function (done) {
    var _id = _ids[2];
    imageb.images.findOne({ _id: _id }, function (err, image) {
      expect(err).not.exist;
      expect(image._id).equal(_id);
      expect(image.uid).equal(userf.user1._id);
      expect(image.fname).equal('1280x720.jpg');
      expect(image.format).equal('jpeg');
      expect(image.vers).eql([ 720, 640 ]);
      expect(image.cdate).exist;
      expect(image.comment).equal('max images');
      var path = new imageb.Image(_id);
      expect(path.getPath(768)).not.pathExist;
      expect(path.getPath(720)).pathExist;
      expect(path.getPath(640)).pathExist;
      done();
    });
  });
  it('posting one more should fail', function (done) {
    this.timeout(30000);
    expl.post('/api/images').attach('files', 'samples/1136x640.jpg').end(function (err, res) {
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
    expl.post('/api/images').attach('files', 'samples/640x360.jpg').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      expect(res.body.err).error('IMAGE_SIZE');
      done();
    });
  });
});

