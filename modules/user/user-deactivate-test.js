var chai = require('chai');
var expect = chai.expect;
chai.use(require('chai-http'));
chai.config.includeStack = true;

var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config')({ path: 'config/test.json' });
var mongo = require('../mongo/mongo')({ dropDatabase: true });
var express2 = require('../main/express');
var userb = require('../user/user-base');
var usera = require('../user/user-auth');
var userf = require('../user/user-fixture');
var userd = require('../user/user-deactivate');

var local = require('../main/local');

init.add(function () {
  var app = express2.app;

  app.get('/test/user', function (req, res, done) {
    usera.identifyUser(res, function (err, user) {
      if (err) return done(err);
      res.json({});
    });
  });
});

before(function (done) {
  init.run(done);
});

describe("deactivating self", function () {
  it("given user1 login", function (done) {
    userf.login('user1', done);
  });
  it("and checked can be accessed", function (done) {
    local.get('/test/user').end(function (err, res) {
      expect(err).not.exist;
      expect(res.error).false;
      expect(res.body.err).not.exist;
      done();
    })
  });
  it("and deactivated", function (done) {
    local.del('/api/users/' + userf.user1._id).end(function (err, res) {
      expect(res.error).false;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it("user1 should be deactivated status", function (done) {
    userb.users.findOne({ _id: userf.user1._id }, function (err, user) {
      expect(err).not.exist;
      (user.status == 'd').should.true;
      done();
    });
  });
  it("and should not be accessed (because logged out)", function (done) {
    local.get('/test/user').end(function (err, res) {
      expect(res.error).false;
      expect(res.body.err).exist;
      error.find(res.body.err, error.NOT_AUTHENTICATED).should.true;
      done();
    });
  });
});

describe("deactivating with no login", function () {
  it("given no login", function (done) {
    userf.logout(done);
  });
  it("should fail", function (done) {
    local.del('/api/users/' + userf.user2._id).end(function (err, res) {
      expect(res.error).false;
      expect(res.body.err).exist;
      error.find(res.body.err, error.NOT_AUTHENTICATED).should.true;
      done();
    });
  });
});

describe("deactivating other", function () {
  it("given user2 login", function (done) {
    userf.login('user2', done);
  });
  it("should fail deactivating user3", function (done) {
    local.del('/api/users/' + userf.user3._id).end(function (err, res) {
      expect(res.error).false;
      expect(res.body.err).exist;
      error.find(res.body.err, error.NOT_AUTHORIZED).should.true;
      done();
    });
  });
});

describe("deactivating by admin", function () {
  it("given admin login", function (done) {
    userf.login('admin', done);
  });
  it("should success deactivating user3", function (done) {
    local.del('/api/users/' + userf.user3._id).end(function (err, res) {
      expect(res.error).false;
      expect(res.body.err).not.exist;
      done();
    });
  });
});

