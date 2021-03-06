var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config')({ path: 'config/test.json' });
var mongob = require('../mongo/mongo-base')({ dropDatabase: true });
var expb = require('../express/express-base');
var expl = require('../express/express-local');
var userb = require('../user/user-base');
var userv = require('../user/user-view');
var userf = require('../user/user-fixture');
var usern = require('../user/user-new');
var expect = require('../base/assert2').expect;

before(function (done) {
  init.run(done);
});

describe('finding user', function () {
  var _user = { name: 'test', email: 'test@def.com', password: '1234'  };
  it('given new user', function (done) {
    expl.post('/api/users').send(_user).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      _user._id = res.body.id;
      done();
    });
  });
  it('given login', function (done) {
    var form = { email: _user.email, password: _user.password };
    expl.post('/api/users/login').send(form).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it('should succeed with email field', function (done) {
    expl.get('/api/users/' + _user._id).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.user._id).equal(_user._id);
      expect(res.body.user.name).equal(_user.name);
      expect(res.body.user.email).equal(_user.email);
      done();
    });
  });
  it('given other\'s login', function (done) {
    userf.login('user2', done);
  });
  it('should succeed without email', function (done) {
    expl.get('/api/users/' + _user._id).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.user._id).equal(_user._id);
      expect(res.body.user.name).equal(_user.name);
      expect(res.body.user.email).not.exist;
      done();
    });
  });
  it('given admin login', function (done) {
    userf.login('admin', done);
  });
  it('should succeed with email', function (done) {
    expl.get('/api/users/' + _user._id).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.user._id).equal(_user._id);
      expect(res.body.user.name).equal(_user.name);
      expect(res.body.user.email).equal(_user.email);
      done();
    });
  });
  it('given no login', function (done) {
    userf.logout(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    })
  });
  it('should succeed without email', function (done) {
    expl.get('/api/users/' + _user._id).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.user._id).equal(_user._id);
      expect(res.body.user.name).equal(_user.name);
      expect(res.body.user.profile).equal('');
      expect(res.body.user.email).not.exist;
      done();
    });
  });
  it('should fail with invalid id', function (done) {
    expl.get('/api/users/999').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      expect(res.body.err).error('USER_NOT_FOUND');
      done();
    });
  });
});

