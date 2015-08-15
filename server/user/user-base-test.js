var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config')({ path: 'config/test.json' });
var mongob = require('../mongo/mongo-base')({ dropDatabase: true });
var expb = require('../express/express-base');
var userb = require('../user/user-base');
var userf = require('../user/user-fixture');
var expl = require('../express/express-local');
var expect = require('../base/assert2').expect;

init.add(function () {
  expb.core.get('/api/test/user', function (req, res, done) {
    userb.checkUser(res, function (err, user) {
      if (err) return done(err);
      res.json({});
    });
  });

  expb.core.get('/api/test/admin', function (req, res, done) {
    userb.checkAdmin(res, function (err, user) {
      if (err) return done(err);
      res.json({});
    });
  });  
});

before(function (done) {
  init.run(done);
});

describe('users', function () {
  it('should exist', function () {
    expect(userb.users).exist;
  });
});

describe('getNewId', function () {
  it('should success', function () {
    expect(userb.getNewId() < userb.getNewId()).true;
  });
});

describe('login', function () {
  it('session should be clear', function (done) {
    expl.get('/api/users/login').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      expect(res.body.err).error('NOT_AUTHENTICATED');
      done();
    });
  });
  it('login should success', function (done) {
    userf.login('user1', function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.user.id).equal(userf.user1._id);
      expect(res.body.user.name).equal(userf.user1.name);
      done();
    })
  });
  it('session should be filled', function (done) {
    expl.get('/api/users/login').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.user.id).equal(userf.user1._id);
      done();
    });
  });
  it('logout should success', function (done) {
    userf.logout(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    })
  });
  it('session should be clear', function (done) {
    expl.get('/api/users/login').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      expect(res.body.err).error('NOT_AUTHENTICATED');
      done();
    });
  });
  it('invalid email should fail', function (done) {
    var form = { email: 'xxx@xxx.com', password: 'xxxx' };
    expl.post('/api/users/login').send(form).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      expect(res.body.err).error('EMAIL_NOT_FOUND');
      done();
    });
  });
  it('invalid password should fail', function (done) {
    var form = { email: userf.user1.email, password: 'xxxx' };
    expl.post('/api/users/login').send(form).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      expect(res.body.err).error('PASSWORD_WRONG');
      done();
    });
  });
});

describe('accessing user resource', function () {
  it('given user session', function (done) {
    userf.login('user1', done);
  });
  it('should success', function (done) {
    expl.get('/api/test/user').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it('given no session', function (done) {
    userf.logout(done);
  });
  it('should fail', function (done) {
    expl.get('/api/test/user').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      expect(res.body.err).error('NOT_AUTHENTICATED');
      done();
    });
  });
});

describe('accessing admin resource', function () {
  it('given admin session', function (done) {
    userf.login('admin', done);
  });
  it('should success', function (done) {
    expl.get('/api/test/admin').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    })
  });
  it('given no session', function (done) {
    userf.logout(done);
  });
  it('should fail', function (done) {
    expl.get('/api/test/admin').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      expect(res.body.err).error('NOT_AUTHENTICATED');
      done();
    });
  });
  it('given user session', function (done) {
    userf.login('user1', done);
  });
  it('should fail', function (done) {
    expl.get('/api/test/admin').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      expect(res.body.err).error('NOT_AUTHORIZED');
      done();
    });
  });
});

describe('auto login', function () {
  it('given new (cookie clean) Agent',function () {
    expl.newAgent();
  });
  it('access should fail', function (done) {
    expl.get('/api/test/user').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      done();
    });
  });
  it('given login with auto login', function (done) {
    userf.login('user1', true, done);
  });
  it('access should success', function (done) {
    expl.get('/api/test/user').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it('given new session', function (done) {
    expl.post('/api/test/destroy-session').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it('access should success', function (done) {
    expl.get('/api/test/user').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it('given logged out', function (done) {
    userf.logout(done);
  });
  it('access should fail', function (done) {
    expl.get('/api/test/user').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      done();
    })
  });
});

describe('auto login with invalid email', function () {
  it('given new (cookie clean) Agent',function () {
    expl.newAgent();
  });
  it('access should fail', function (done) {
    expl.get('/api/test/user').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      done();
    });
  });
  it('given login with auto login', function (done) {
    userf.login('user1', true, done);
  });
  it('access should success', function (done) {
    expl.get('/api/test/user').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it('cookie should be filled', function (done) {
    expl.get('/api/test/cookies').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.email).equal(userf.user1.email);
      done();
    });
  });
  it('given email changed', function (done) {
    var fields = {
      email: 'new@def.com'
    };
    userb.users.updateOne({ _id: userf.user1._id }, fields, function (err, r) {
      expect(err).not.exist;
      expect(r.matchedCount).equal(1);
      done();
    });
  });
  it('given new session', function (done) {
    expl.post('/api/test/destroy-session').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it('should fail', function (done) {
    expl.get('/api/test/user').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      done();
    });
  });
  it('cookie should be destroied', function (done) {
    expl.get('/api/test/cookies').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.email).not.exist;
      done();
    });
  });
});

describe('redirecting to login page', function () {
  it('given handler', function (done) {
    expb.core.get('/test/public', function (req, res, done) {
      res.send('public');
    });
    expb.core.get('/test/private', function (req, res, done) {
      userb.checkUser(res, function (err, user) {
        if (err) return done(err);
        res.send('private');
      })
    });
    done();
  });
  it('public should success', function (done) {
    expl.get('/test/public').end(function (err, res) {
      expect(err).not.exist;
      expect(res.text).equal('public');
      done();
    });
  });
  it('private should success', function (done) {
    expl.get('/test/private').redirects(0).end(function (err, res) {
      expect(err).exist;
      expect(res).status(302); // Moved Temporarily 
      expect(res).header('location', '/users/login');
      done();
    });
  });
});