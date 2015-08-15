var expect = require('../base/assert2').expect;;

var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config')({ path: 'config/test.json' });
var mongob = require('../mongo/mongo-base')({ dropDatabase: true });
var expb = require('../express/express-base');
var userb = require('../user/user-base');
var userf = require('../user/user-fixture');
var userp = require('../image/image-listu');
var expl = require('../express/express-local');

before(function (done) {
  init.run(done);
});

describe('user profile page', function () {
  it('should success', function (done) {
    expl.get('/user1').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it('uppercase should success', function (done) {
    expl.get('/USER1').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it('invalid home name should fail', function (done) {
    expl.get('/xman').end(function (err, res) {
      expect(err).exist;
      done();
    });
  });
});