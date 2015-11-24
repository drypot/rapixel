var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config')({ path: 'config/test.json' });
var mongob = require('../mongo/mongo-base')({ dropDatabase: true });
var expb = require('../express/express-base');
var expl = require('../express/express-local');
var userb = require('../user/user-base');
var expect = require('../base/assert2').expect;

before(function (done) {
  init.run(done);
});

describe('users', function () {
  it('should exist', function () {
    expect(userb.users).exist;
  });
});

describe('getNewId', function () {
  it('should succeed', function () {
    expect(userb.getNewId() < userb.getNewId()).true;
  });
});
