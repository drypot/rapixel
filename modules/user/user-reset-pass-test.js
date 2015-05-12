var bcrypt = require('bcrypt');

var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config')({ path: 'config/test.json' });
var mongop = require('../mongo/mongo')({ dropDatabase: true });
var exp = require('../express/express');
var userb = require('../user/user-base');
var userf = require('../user/user-fixture');
var userp = require('../user/user-reset-pass');
var local = require('../express/local');
var expect = require('../base/assert').expect;

before(function (done) {
  init.run(done);
});

describe('resetting user', function () {
  var _user;
  var _reset;
  before(function () {
    _user = userf.user1;
  });
  it('old password should be ok', function (done) {
    userb.users.findOne({ email: _user.email }, function (err, user) {
      expect(err).not.exist;
      expect(userb.checkPassword(_user.password, user.hash)).true;
      done();
    });
  });
  it('reset request should success', function (done) {
    local.post('/api/reset-pass').send({ email: _user.email }).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it('can be checked', function (done) {
    userp.resets.findOne({ email: _user.email }, function (err, reset) {
      expect(err).not.exist;
      expect(reset._id).exist;
      expect(reset.token).exist;
      expect(reset.email).equal(_user.email);
      _reset = reset;
      done();
    });
  });
  it('invalid email should fail', function (done) {
    local.post('/api/reset-pass').send({ email: 'abc.def.xyz' }).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      expect(res.body.err).error('EMAIL_PATTERN');
      done();
    });
  });
  it('unregistered email should fail', function (done) {
    local.post('/api/reset-pass').send({ email: 'non-exist@xyz.com' }).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      expect(res.body.err).error('EMAIL_NOT_EXIST');
      done();
    });
  });
  it('invalid id should fail', function (done) {
    var form = { id: '012345678901234567890123', token: _reset.token, password: '4567' };
    local.put('/api/reset-pass').send(form).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      expect(res.body.err).error('INVALID_DATA');
      done();
    });
  });
  it('invalid token should fail', function (done) {
    var form = { id: _reset._id, token: 'xxxxx', password: '4567' };
    local.put('/api/reset-pass').send(form).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      expect(res.body.err).error('INVALID_DATA');
      done();
    });
  });
  it('invalid password should fail', function (done) {
    var form = { id: _reset._id, token: _reset.token, password: '' };
    local.put('/api/reset-pass').send(form).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      expect(res.body.err).error('PASSWORD_EMPTY');
      done();
    });
  });
  it('invalid password should fail', function (done) {
    var form = { id: _reset._id, token: _reset.token, password: 'xx' };
    local.put('/api/reset-pass').send(form).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      expect(res.body.err).error('PASSWORD_RANGE');
      done();
    });
  });
  it('should success', function (done) {
    var form = { id: _reset._id, token: _reset.token, password: 'new-pass' };
    local.put('/api/reset-pass').send(form).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it('old password should fail', function (done) {
    userb.users.findOne({ email: _user.email }, function (err, user) {
      expect(err).not.exist;
      expect(userb.checkPassword(_user.password, user.hash)).false;
      done();
    });
  });
  it('new password should success', function (done) {
    userb.users.findOne({ email: _user.email }, function (err, user) {
      expect(err).not.exist;
      expect(userb.checkPassword('new-pass', user.hash)).true;
      done();
    });
  });
});

describe('resetting admin', function () {
  var _user;
  var _reset;
  before(function () {
    _user = userf.admin;
  });
  it('old password should success', function (done) {
    userb.users.findOne({ email: _user.email }, function (err, user) {
      expect(err).not.exist;
      expect(userb.checkPassword(_user.password, user.hash)).true;
      done();
    });
  });
  it('given reset request', function (done) {
    var form = { email: _user.email };
    local.post('/api/reset-pass').send(form).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it('can be checked', function (done) {
    userp.resets.findOne({ email: _user.email }, function (err, reset) {
      expect(err).not.exist;
      expect(reset._id).exist;
      expect(reset.token).exist;
      expect((reset.email == _user.email)).true;
      _reset = reset;
      done();
    });
  });
  it('should success', function (done) {
    var form = { id: _reset._id, token: _reset.token, password: 'new-pass' };
    local.put('/api/reset-pass').send(form).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it('old password should success', function (done) {
    userb.users.findOne({ email: _user.email }, function (err, user) {
      expect(err).not.exist;
      expect(userb.checkPassword(_user.password, user.hash)).true;
      done();
    });
  });
  it('new password should fail', function (done) {
    userb.users.findOne({ email: _user.email }, function (err, user) {
      expect(err).not.exist;
      expect(userb.checkPassword('new-pass', user.hash)).false;
      done();
    });
  });
});