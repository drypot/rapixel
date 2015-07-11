var expect = require('../base/assert').expect;;

var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config')({ path: 'config/test.json' });
var mongop = require('../mongo/mongo')({ dropDatabase: true });
var exp = require('../express/express');
var userb = require('../user/user-base');
var userf = require('../user/user-fixture');
var userp = require('../image/image-listu');
var local = require('../express/local');

before(function (done) {
  init.run(done);
});

describe('user profile page', function () {
  it('should success', function (done) {
    local.get('/user1').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it('uppercase should success', function (done) {
    local.get('/USER1').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it('invalid home name should fail', function (done) {
    local.get('/xman').end(function (err, res) {
      expect(err).exist;
      done();
    });
  });
});