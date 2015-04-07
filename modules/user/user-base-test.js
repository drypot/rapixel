var chai = require('chai');
var expect = chai.expect;
chai.use(require('chai-http'));
chai.config.includeStack = true;

var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config')({ path: 'config/test.json' });
var mongop = require('../mongo/mongo')({ dropDatabase: true });
var exp = require('../express/express');
var userb = require('../user/user-base');
var userf = require('../user/user-fixture');
var local = require('../express/local');

init.add(function () {
  exp.core.get('/api/test/user', function (req, res, done) {
    userb.checkUser(res, function (err, user) {
      if (err) return done(err);
      res.json({});
    });
  });

  exp.core.get('/api/test/admin', function (req, res, done) {
    userb.checkAdmin(res, function (err, user) {
      if (err) return done(err);
      res.json({});
    });
  });  

  exp.core.delete('/api/test/del-session', function (req, res, done) {
    req.session.destroy();
    res.json({});
  });
});

before(function (done) {
  init.run(done);
});

describe("newId", function () {
  it("should success", function () {
    var id1 = userb.newId();
    var id1 = userb.newId();
    var id2 = userb.newId();
    var id2 = userb.newId();
    expect(id1 < id2).true;
  });
});

describe("user fixture", function () {
  it("session should be clear", function (done) {
    local.get('/api/users/login').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.uid).not.exist;
      done();
    });
  });
  it("login should success", function (done) {
    userf.login('user1', function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.user.id).equal(userf.user1._id);
      expect(res.body.user.name).equal(userf.user1.name);
      done();
    })
  });
  it("session should be filled", function (done) {
    local.get('/api/users/login').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.uid).equal(userf.user1._id);
      done();
    });
  });
  it("logout should success", function (done) {
    userf.logout(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body).eql({});
      done();
    })
  });
  it("session should be clear", function (done) {
    local.get('/api/users/login').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.uid).not.exist;
      done();
    });
  });
});

describe("login", function () {
  it("invalid email should fail", function (done) {
    var form = { email: 'xxx@xxx.com', password: 'xxxx' };
    local.post('/api/users/login').send(form).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      expect(error.find(res.body.err, error.EMAIL_NOT_FOUND)).true;
      done();
    });
  });
  it("invalid password should fail", function (done) {
    var form = { email: userf.user1.email, password: 'xxxx' };
    local.post('/api/users/login').send(form).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      expect(error.find(res.body.err, error.PASSWORD_WRONG)).true;
      done();
    });
  });
});

describe("accessing user resource", function () {
  it("given user session", function (done) {
    userf.login('user1', done);
  });
  it("should success", function (done) {
    local.get('/api/test/user').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it("given no session", function (done) {
    userf.logout(done);
  });
  it("should fail", function (done) {
    local.get('/api/test/user').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      expect(error.find(res.body.err, error.NOT_AUTHENTICATED)).true;
      done();
    });
  });
});

describe("accessing admin resource", function () {
  it("given admin session", function (done) {
    userf.login('admin', done);
  });
  it("should success", function (done) {
    local.get('/api/test/admin').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    })
  });
  it("given no session", function (done) {
    userf.logout(done);
  });
  it("should fail", function (done) {
    local.get('/api/test/admin').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      expect(error.find(res.body.err, error.NOT_AUTHENTICATED)).true;
      done();
    });
  });
  it("given user session", function (done) {
    userf.login('user1', done);
  });
  it("should fail", function (done) {
    local.get('/api/test/admin').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      expect(error.find(res.body.err, error.NOT_AUTHORIZED)).true;
      done();
    });
  });
});

describe("identifying without auto login", function () {
  it("given test session", function (done) {
    local.newSession();
    done();
  });
  it("should fail", function (done) {
    local.get('/api/test/user').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      done();
    });
  });
  it("given user session", function (done) {
    userf.login('user1', done);
  });
  it("should success", function (done) {
    local.get('/api/test/user').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it("given new session", function (done) {
    local.del('/api/test/del-session').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it("should fail", function (done) {
    local.get('/api/test/user').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      done();
    });
  });
});

describe("identifying with auto login", function () {
  it("given new sesssion",function (done) {
    local.newSession();
    done();
  });
  it("should fail", function (done) {
    local.get('/api/test/user').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      done();
    });
  });
  it("given user session with auto login", function (done) {
    userf.login('user1', true, done);
  });
  it("should success", function (done) {
    local.get('/api/test/user').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it("given new session", function (done) {
    local.del('/api/test/del-session').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it("should success", function (done) {
    local.get('/api/test/user').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it("given logged out", function (done) {
    userf.logout(done);
  });
  it("should fail", function (done) {
    local.get('/api/test/user').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      done();
    })
  });
});

describe("identifying with auto login with invalid email", function () {
  it("given handler", function () {
    exp.core.get('/api/test/cookies', function (req, res, done) {
      res.json({
        email: req.cookies.email,
        password: req.cookies.password
      });
    });
  });
  it("given new sesssion",function (done) {
    local.newSession();
    done();
  });
  it("should fail", function (done) {
    local.get('/api/test/user').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      done();
    });
  });
  it("given user session with auto login", function (done) {
    userf.login('user1', true, done);
  });
  it("should success", function (done) {
    local.get('/api/test/user').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it("cookie should be filled", function (done) {
    local.get('/api/test/cookies').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.email).equal(userf.user1.email);
      done();
    });
  });
  it("given email changed", function (done) {
    var fields = {
      email: "new@def.com"
    };
    userb.users.update({ _id: userf.user1._id }, fields, function (err, cnt) {
      expect(err).not.exist;
      expect((cnt == 1)).true;
      done();
    });
  });
  it("given session expired", function (done) {
    local.del('/api/test/del-session').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it("should fail", function (done) {
    local.get('/api/test/user').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      done();
    });
  });
  it("cookie should not be filled", function (done) {
    local.get('/api/test/cookies').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.email).not.exist;
      done();
    });
  });
});

describe("redirecting to login page", function () {
  it("given handler", function (done) {
    exp.core.get('/test/public', function (req, res, done) {
      res.send('public');
    });
    exp.core.get('/test/private', function (req, res, done) {
      userb.checkUser(res, function (err, user) {
        if (err) return done(err);
        res.send('private');
      })
    });
    done();
  });
  it("public should success", function (done) {
    local.get('/test/public').end(function (err, res) {
      expect(err).not.exist;
      expect(res.text).equal('public');
      done();
    });
  });
  it("private should success", function (done) {
    local.get('/test/private').redirects(0).end(function (err, res) {
      expect(err).exist;
      expect(res).status(302); // Moved Temporarily 
      expect(res).header('location', '/users/login');
      done();
    });
  });
});