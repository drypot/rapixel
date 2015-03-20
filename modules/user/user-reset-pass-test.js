var chai = require('chai');
var expect = chai.expect;
chai.use(require('chai-http'));
chai.config.includeStack = true;

var bcrypt = require('bcrypt');

var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config')({ path: 'config/test.json' });
var mongo = require('../mongo/mongo')({ dropDatabase: true });
var express2 = require('../main/express');
var userb = require('../user/user-base');
var userf = require('../user/user-fixture');
var userp = require('../user/user-reset-pass');

var local = require('../main/local');

before(function (done) {
  init.run(done);
});

describe("resets collection", function () {
  it("should exist", function () {
    should.exist(userb.resets);
  });
});

describe("resetting user", function () {
  var _user;
  var _reset;
  before(function () {
    _user = userf.user1;
  });
  it("should success old password", function (done) {
    userb.users.findOne({ email: _user.email }, function (err, user) {
      expect(err).not.exist;
      userb.checkPassword(_user.password, user.hash).should.true;
      done();
    });
  });
  it("given new reset request", function (done) {
    var form = { email: _user.email };
    local.post('/api/reset-pass').send(form).end(function (err, res) {
      expect(res.error).false;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it("can be checked", function (done) {
    userb.resets.findOne({ email: _user.email }, function (err, reset) {
      expect(err).not.exist;
      should.exist(reset._id);
      should.exist(reset.token);
      (reset.email == _user.email).should.true;
      _reset = reset;
      done();
    });
  });
  it("should fail with invalid email", function (done) {
    var form = { email: 'abc.def.xyz' };
    local.post('/api/reset-pass').send(form).end(function (err, res) {
      expect(res.error).false;
      expect(res.body.err).exist;
      error.find(res.body.err, error.EMAIL_PATTERN).should.true;
      done();
    });
  });
  it("should fail with non-exist email", function (done) {
    var form = { email: 'non-exist@xyz.com' };
    local.post('/api/reset-pass').send(form).end(function (err, res) {
      expect(res.error).false;
      expect(res.body.err).exist;
      error.find(res.body.err, error.EMAIL_NOT_EXIST).should.true;
      done();
    });
  });
  it("should fail with invalid id", function (done) {
    var form = { id: '012345678901234567890123', token: _reset.token, password: '4567' };
    local.put('/api/reset-pass').send(form).end(function (err, res) {
      expect(res.error).false;
      expect(res.body.err).exist;
      error.find(res.body.err, error.INVALID_DATA).should.true;
      done();
    });
  });
  it("should fail with invalid token", function (done) {
    var form = { id: _reset._id, token: 'xxxxx', password: '4567' };
    local.put('/api/reset-pass').send(form).end(function (err, res) {
      expect(res.error).false;
      expect(res.body.err).exist;
      error.find(res.body.err, error.INVALID_DATA).should.true;
      done();
    });
  });
  it("should fail with invalid password", function (done) {
    var form = { id: _reset._id, token: _reset.token, password: '' };
    local.put('/api/reset-pass').send(form).end(function (err, res) {
      expect(res.error).false;
      expect(res.body.err).exist;
      error.find(res.body.err, error.PASSWORD_EMPTY).should.true;
      done();
    });
  });
  it("should fail with invalid password", function (done) {
    var form = { id: _reset._id, token: _reset.token, password: 'xx' };
    local.put('/api/reset-pass').send(form).end(function (err, res) {
      expect(res.error).false;
      expect(res.body.err).exist;
      error.find(res.body.err, error.PASSWORD_RANGE).should.true;
      done();
    });
  });
  it("should success", function (done) {
    var form = { id: _reset._id, token: _reset.token, password: 'new-pass' };
    local.put('/api/reset-pass').send(form).end(function (err, res) {
      expect(res.error).false;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it("should fail old password", function (done) {
    userb.users.findOne({ email: _user.email }, function (err, user) {
      expect(err).not.exist;
      userb.checkPassword(_user.password, user.hash).should.false;
      done();
    });
  });
  it("should success new password", function (done) {
    userb.users.findOne({ email: _user.email }, function (err, user) {
      expect(err).not.exist;
      userb.checkPassword('new-pass', user.hash).should.true;
      done();
    });
  });
});

describe("resetting admin", function () {
  var _user;
  var _reset;
  before(function () {
    _user = userf.admin;
  });
  it("should success old password", function (done) {
    userb.users.findOne({ email: _user.email }, function (err, user) {
      expect(err).not.exist;
      userb.checkPassword(_user.password, user.hash).should.true;
      done();
    });
  });
  it("given new reset request", function (done) {
    var form = { email: _user.email };
    local.post('/api/reset-pass').send(form).end(function (err, res) {
      expect(res.error).false;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it("can be checked", function (done) {
    userb.resets.findOne({ email: _user.email }, function (err, reset) {
      expect(err).not.exist;
      should.exist(reset._id);
      should.exist(reset.token);
      (reset.email == _user.email).should.true;
      _reset = reset;
      done();
    });
  });
  it("should success", function (done) {
    var form = { id: _reset._id, token: _reset.token, password: 'new-pass' };
    local.put('/api/reset-pass').send(form).end(function (err, res) {
      expect(res.error).false;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it("should success old password (password not changed)", function (done) {
    userb.users.findOne({ email: _user.email }, function (err, user) {
      expect(err).not.exist;
      userb.checkPassword(_user.password, user.hash).should.true;
      done();
    });
  });
  it("should fail new password", function (done) {
    userb.users.findOne({ email: _user.email }, function (err, user) {
      expect(err).not.exist;
      userb.checkPassword('new-pass', user.hash).should.false;
      done();
    });
  });
});