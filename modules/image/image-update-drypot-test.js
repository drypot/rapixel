var expect = require('../base/chai').expect;

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
var imageu = require('../image/image-update');
var local = require('../express/local');

before(function (done) {
  init.run(done);
});

before(function (done) {
  userf.login('user1', done);
});

before(function (done) {
  imageb.emptyDir(done);
});

describe('updating with new image', function () {
  var _id;
  it('given post', function (done) {
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
  it('can be checked', function (done) {
    imageb.images.findOne({ _id: _id }, function (err, image) {
      expect(err).not.exist;
      expect(image).exist;
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
  it('should success', function (done) {
    this.timeout(30000);
    local.put('/api/images/' + _id).field('comment', 'image2').attach('files', 'samples/svg-sample-2.svg').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it('can be checked', function (done) {
    imageb.images.findOne({ _id: _id }, function (err, image) {
      expect(err).not.exist;
      expect(image).exist;
      expect(image.fname).equal('svg-sample-2.svg');
      expect(image.format).equal('svg');
      expect(image.width).not.exist;
      expect(image.vers).not.exist;
      expect(image.cdate).exist;
      expect(image.comment).equal('image2');
      expect(new imageb.FilePath(_id, 'svg').original).pathExist;
      done();
    });
  });
});

describe('updating with jpeg', function () {
  var _id;
  it('given post', function (done) {
    var form = {
      _id: _id = imageb.getNewId(),
      uid: userf.user1._id
    };
    imageb.images.insert(form, done);
  });
  it('should fail', function (done) {
    this.timeout(30000);
    local.put('/api/images/' + _id).attach('files', 'samples/1136x640-169.jpg').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      expect(error.find(res.body.err, error.IMAGE_TYPE)).true;
      done();
    });
  });
});
