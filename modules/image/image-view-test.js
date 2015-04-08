var chai = require('chai');
var expect = chai.expect;
chai.use(require('chai-http'));
chai.config.includeStack = true;

var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config')({ path: 'config/test.json' });
var mongop = require('../mongo/mongo')({ dropDatabase: true });
var exp = require('../express/express');
var upload = require('../express/upload');
var userf = require('../user/user-fixture');
var imagec = require('../image/image-create');
var imagev = require('../image/image-view');
var local = require('../express/local');

before(function (done) {
  init.run(done);
});

before(function (done) {
  userf.login('user1', done);
});

describe('getting', function () {
  var _f1 = 'samples/3840x2160-169.jpg';
  var _id;
  var _files;
  it('given image', function (done) {
    this.timeout(30000);
    var post = local.post('/api/images')
      .field('comment', 'image1')
      .attach('files', _f1);
    post.end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.ids).exist;
      expect(res.body.ids.length).equal(1);
      _id = res.body.ids[0];
      done();
    });
  });
  it('should success', function (done) {
    local.get('/api/images/' + _id).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.hit).equal(0);
      done();
    });
  });
  it('hit should success', function (done) {
    local.get('/api/images/' + _id + '?hit').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.hit).equal(1);
      done();
    });
  });
});

