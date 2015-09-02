var fs = require('fs');

var init = require('../base/init');
var error = require('../base/error');
var fs2 = require('../base/fs2');
var config = require('../base/config')({ path: 'config/test.json' });
var mongob = require('../mongo/mongo-base')({ dropDatabase: true });
var expb = require('../express/express-base');
var expu = require('../express/express-upload');
var expl = require('../express/express-local');
var userf = require('../user/user-fixture');
var imageb = require('../image/image-base');
var imaged = require('../image/image-delete');
var expect = require('../base/assert2').expect;

before(function (done) {
  init.run(done);
});

before(function (done) {
  imageb.emptyDir(done);
});

var _f1 = 'samples/3840x2160-169.jpg';
var _id;

describe('deleting', function () {
  before(function (done) {
    imageb.images.deleteMany(done);
  });
  it('given user1 login', function (done) {
    userf.login('user1', done);
  });
  it('given post', function (done) {
    this.timeout(30000);
    expl.post('/api/images').field('comment', 'image1').attach('files', _f1).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.ids).exist;
      _id = res.body.ids[0];
      done();
    });
  });
  it('should success', function (done) {
    expl.del('/api/images/' + _id, function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it('can be checked', function (done) {
    expect(new imageb.FilePath(_id).getVersion(3840)).not.pathExist;
    imageb.images.findOne({ _id: _id }, function (err, image) {
      expect(err).not.exist;
      expect(image).not.exist;
      done();
    });
  });
});

describe('deleting by admin', function () {
  before(function (done) {
    imageb.images.deleteMany(done);
  });
  it('given user1 login', function (done) {
    userf.login('user1', done);
  });
  it('given post', function (done) {
    this.timeout(30000);
    expl.post('/api/images').field('comment', 'image1').attach('files', _f1).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.ids).exist;
      _id = res.body.ids[0];
      done();
    });
  });
  it('given admin login', function (done) {
    userf.login('admin', done);
  });
  it('should success', function (done) {
    expl.del('/api/images/' + _id, function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it('can be checked', function (done) {
    expect(new imageb.FilePath(_id).getVersion(3840)).not.pathExist;
    imageb.images.findOne({ _id: _id }, function (err, image) {
      expect(err).not.exist;
      expect(image).not.exist;
      done();
    });
  });
});

describe('deleting other\'s', function () {
  before(function (done) {
    imageb.images.deleteMany(done);
  });
  it('given user1 login', function (done) {
    userf.login('user1', done);
  });
  it('given post', function (done) {
    this.timeout(30000);
    expl.post('/api/images').field('comment', 'image1').attach('files', _f1).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.ids).exist;
      _id = res.body.ids[0];
      done();
    });
  });
 it('given user2 login', function (done) {
    userf.login('user2', done);
  });
  it('should fail', function (done) {
    expl.del('/api/images/' + _id, function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      expect(res.body.err).error('NOT_AUTHORIZED');
      done();
    });
  });
  it('can be checked', function (done) {
    expect(new imageb.FilePath(_id).getVersion(3840)).pathExist;
    imageb.images.findOne({ _id: _id }, function (err, image) {
      expect(err).not.exist;
      expect(image).exist;
      done();
    });
  });
});
