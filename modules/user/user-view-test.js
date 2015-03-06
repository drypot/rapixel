var should = require('should');

var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config')({ path: 'config/rapixel-test.json' });
var mongo = require('../mongo/mongo')({ dropDatabase: true });
var express2 = require('../main/express');
var usera = require('../user/user-auth');
var userc = require('../user/user-create');
var userv = require('../user/user-view');
var userf = require('../user/user-fixture');

before(function (done) {
  init.run(done);
});

before(function () {
  express2.listen();
});

describe("finding user", function () {
  var _user = { name: 'test', email: 'test@def.com', password: '1234'  };
  it("given new user", function (done) {
    express2.post('/api/users').send(_user).end(function (err, res) {
      res.error.should.false;
      should.not.exist(res.body.err);
      _user._id = res.body.id;
      done();
    });
  });
  it("given login", function (done) {
    var form = { email: _user.email, password: _user.password };
    express2.post('/api/sessions').send(form).end(function (err, res) {
      res.error.should.false;
      should.not.exist(res.body.err);
      done();
    });
  });
  it("should return email", function (done) {
    express2.get('/api/users/' + _user._id).end(function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      should.not.exist(res.body.err);
      res.body.user._id.should.equal(_user._id);
      res.body.user.name.should.equal(_user.name);
      res.body.user.email.should.equal(_user.email);
      done();
    });
  });
  it("given other's login", function (done) {
    userf.loginUser2(done);
  });
  it("should not return email", function (done) {
    express2.get('/api/users/' + _user._id).end(function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      should.not.exist(res.body.err);
      res.body.user._id.should.equal(_user._id);
      res.body.user.name.should.equal(_user.name);
      should.not.exist(res.body.user.email);
      done();
    });
  });
  it("given admin login", function (done) {
    userf.loginAdmin(done);
  });
  it("should return email", function (done) {
    express2.get('/api/users/' + _user._id).end(function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      should.not.exist(res.body.err);
      res.body.user._id.should.equal(_user._id);
      res.body.user.name.should.equal(_user.name);
      res.body.user.email.should.equal(_user.email);
      done();
    });
  });
  it("given no login", function (done) {
    express2.del('/api/sessions', function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      should.not.exist(res.body.err);
      done();
    })
  });
  it("should not return email", function (done) {
    express2.get('/api/users/' + _user._id).end(function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      should.not.exist(res.body.err);
      res.body.user._id.should.equal(_user._id);
      res.body.user.name.should.equal(_user.name);
      res.body.user.profile.should.equal('');
      should.not.exist(res.body.user.email);
      done();
    });
  });
  it("should fail with invalid id", function (done) {
    express2.get('/api/users/999').end(function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      should.exist(res.body.err);
      error.find(res.body.err, error.USER_NOT_FOUND).should.true;
      done();
    });
  });
});
