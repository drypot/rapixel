var chai = require('chai');
var expect = chai.expect;
chai.use(require('chai-http'));
chai.config.includeStack = true;

var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config')({ path: 'config/test.json' });
var mongo = require('../mongo/mongo')({ dropDatabase: true });
var express2 = require('../main/express');
var usera = require('../user/user-auth');
var userv = require('../user/user-view');
var userf = require('../user/user-fixture');
var local = require('../main/local');

before(function (done) {
  init.run(done);
});

describe.only("finding user", function () {
  var _user = { name: 'test', email: 'test@def.com', password: '1234'  };
  it("given new user", function (done) {
    local.post('/api/users').send(_user).end(function (err, res) {
      expect(err).not.exist;
      expect(res.error).false;
      expect(res.body.err).not.exist;
      _user._id = res.body.id;
      done();
    });
  });
  it("given login", function (done) {
    var form = { email: _user.email, password: _user.password };
    local.post('/api/session').send(form).end(function (err, res) {
      expect(err).not.exist;
      expect(res.error).false;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it("should success with email field", function (done) {
    local.get('/api/users/' + _user._id).end(function (err, res) {
      expect(err).not.exist;
      expect(res.error).false;
      expect(res.body.err).not.exist;
      expect(res.body.user._id).equal(_user._id);
      expect(res.body.user.name).equal(_user.name);
      expect(res.body.user.email).equal(_user.email);
      done();
    });
  });
  it("given other's login", function (done) {
    userf.login('user2', done);
  });
  it("should success without email", function (done) {
    local.get('/api/users/' + _user._id).end(function (err, res) {
      expect(err).not.exist;
      expect(res.error).false;
      expect(res.body.err).not.exist;
      expect(res.body.user._id).equal(_user._id);
      expect(res.body.user.name).equal(_user.name);
      expect(res.body.user.email).not.exist;
      done();
    });
  });
  it("given admin login", function (done) {
    userf.login('admin', done);
  });
  it("should success with email", function (done) {
    local.get('/api/users/' + _user._id).end(function (err, res) {
      expect(err).not.exist;
      expect(res.error).false;
      expect(res.body.err).not.exist;
      expect(res.body.user._id).equal(_user._id);
      expect(res.body.user.name).equal(_user.name);
      expect(res.body.user.email).equal(_user.email);
      done();
    });
  });
  it("given no login", function (done) {
    local.del('/api/session', function (err, res) {
      expect(err).not.exist;
      expect(res.error).false;
      expect(res.body.err).not.exist;
      done();
    })
  });
  it("should success without email", function (done) {
    local.get('/api/users/' + _user._id).end(function (err, res) {
      expect(err).not.exist;
      expect(res.error).false;
      expect(res.body.err).not.exist;
      expect(res.body.user._id).equal(_user._id);
      expect(res.body.user.name).equal(_user.name);
      expect(res.body.user.profile).equal('');
      expect(res.body.user.email).not.exist;
      done();
    });
  });
  it("should fail with invalid id", function (done) {
    local.get('/api/users/999').end(function (err, res) {
      expect(err).not.exist;
      expect(res.error).false;
      expect(res.body.err).exist;
      expect(error.find(res.body.err, error.USER_NOT_FOUND)).true;
      done();
    });
  });
});

