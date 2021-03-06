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
var imageu = require('../image/image-update');
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

describe('updating with image', function () {
  var _id;
  it('given post', function (done) {
    this.timeout(30000);
    expl.post('/api/images').field('comment', 'image1').attach('files', 'samples/5120x2880.jpg').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.ids).exist;
      expect(res.body.ids.length).equal(1);
      _id = res.body.ids[0];
      done();
    });
  });
  it('can be checked', function (done) {
    imageb.images.findOne({ _id: _id }, function (err, image) {
      expect(err).not.exist;
      expect(image).exist;
      expect(image.fname).equal('5120x2880.jpg');
      expect(image.format).equal('jpeg');
      expect(image.width).equal(5120);
      expect(image.vers).eql([ 5120, 3840, 2880, 2560, 2048, 1920, 1680, 1440, 1366, 1280, 1136, 1024, 960, 640 ]);
      expect(image.cdate).exist;
      expect(image.comment).equal('image1');
      var path = new imageb.Image(_id);
      expect(path.getPath(5120)).pathExist;
      expect(path.getPath(3840)).pathExist;
      expect(path.getPath(640)).pathExist;
      done();
    });
  });
  it('should succeed', function (done) {
    this.timeout(30000);
    expl.put('/api/images/' + _id).field('comment', 'image2').attach('files', 'samples/3840x2160.jpg').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it('can be checked', function (done) {
    imageb.images.findOne({ _id: _id }, function (err, image) {
      expect(err).not.exist;
      expect(image).exist;
      expect(image.fname).equal('3840x2160.jpg');
      expect(image.format).equal('jpeg');
      expect(image.width).equal(3840);
      expect(image.vers).eql([ 3840, 2880, 2560, 2048, 1920, 1680, 1440, 1366, 1280, 1136, 1024, 960, 640 ]);
      expect(image.cdate).exist;
      expect(image.comment).equal('image2');
      var path = new imageb.Image(_id);
      expect(path.getPath(5120)).not.pathExist;
      expect(path.getPath(3840)).pathExist;
      expect(path.getPath(1280)).pathExist;
      expect(path.getPath(640)).pathExist;
      done();
    });
  });
});

describe('updating with small image', function () {
  var _id;
  it('given post', function (done) {
    var form = {
      _id: _id = imageb.getNewId(),
      uid: userf.user1._id
    };
    imageb.images.insertOne(form, done);
  });
  it('should fail', function (done) {
    expl.put('/api/images/' + _id).attach('files', 'samples/2880x1620.jpg').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      expect(res.body.err).error('IMAGE_SIZE');
      done();
    });
  });
});
