var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config')({ path: 'config/test.json' });
var mongob = require('../mongo/mongo-base')({ dropDatabase: true });
var expb = require('../express/express-base');
var expu = require('../express/express-upload');
var expl = require('../express/express-local');
var userf = require('../user/user-fixture');
var imagen = require('../image/image-new');
var imagev = require('../image/image-view');
var expect = require('../base/assert2').expect;

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
    var post = expl.post('/api/images')
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
    expl.get('/api/images/' + _id).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.hit).equal(0);
      done();
    });
  });
  it('hit should success', function (done) {
    expl.get('/api/images/' + _id + '?hit').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.hit).equal(1);
      done();
    });
  });
});

