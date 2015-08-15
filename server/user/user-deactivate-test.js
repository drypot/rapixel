var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config')({ path: 'config/test.json' });
var mongob = require('../mongo/mongo-base')({ dropDatabase: true });
var expb = require('../express/express-base');
var userb = require('../user/user-base');
var userf = require('../user/user-fixture');
var userd = require('../user/user-deactivate');
var expl = require('../express/express-local');
var expect = require('../base/assert2').expect;

init.add(function () {
  expb.core.get('/api/test/user', function (req, res, done) {
    userb.checkUser(res, function (err, user) {
      if (err) return done(err);
      res.json({});
    });
  });
});

before(function (done) {
  init.run(done);
});

describe('deactivating self', function () {
  it('given user1 login', function (done) {
    userf.login('user1', done);
  });
  it('checkUser should success', function (done) {
    expl.get('/api/test/user').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    })
  });
  it('should success', function (done) {
    expl.del('/api/users/' + userf.user1._id).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it('can be checked', function (done) {
    userb.users.findOne({ _id: userf.user1._id }, function (err, user) {
      expect(err).not.exist;
      expect(user.status == 'd').true;
      done();
    });
  });
  it('checkUser should fail (because logged off)', function (done) {
    expl.get('/api/test/user').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      expect(res.body.err).error('NOT_AUTHENTICATED');
      done();
    });
  });
});

describe('deactivating with no login', function () {
  it('given no login', function (done) {
    userf.logout(done);
  });
  it('should fail', function (done) {
    expl.del('/api/users/' + userf.user2._id).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      expect(res.body.err).error('NOT_AUTHENTICATED');
      done();
    });
  });
});

describe('deactivating other', function () {
  it('given user2 login', function (done) {
    userf.login('user2', done);
  });
  it('deactivating other should fail', function (done) {
    expl.del('/api/users/' + userf.user3._id).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      expect(res.body.err).error('NOT_AUTHORIZED');
      done();
    });
  });
});

describe('deactivating other by admin', function () {
  it('given admin login', function (done) {
    userf.login('admin', done);
  });
  it('should success', function (done) {
    expl.del('/api/users/' + userf.user3._id).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
});

