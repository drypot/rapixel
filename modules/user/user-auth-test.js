var should = require('should');

var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config')({ path: 'config/rapixel-test.json' });
var mongo = require('../mongo/mongo')({ dropDatabase: true });
var express2 = require('../main/express');
var userb = require('../user/user-base');
var usera = require('../user/user-auth');
var userf = require('../user/user-fixture');

init.add(function () {
  var app = express2.app;

  app.get('/test/user', function (req, res) {
    usera.getUser(res, function (err, user) {
      if (err) return res.jsonErr(err);
      res.json({});
    });
  });

  app.get('/test/admin', function (req, res) {
    usera.getAdmin(res, function (err, user) {
      if (err) return res.jsonErr(err);
      res.json({});
    });
  });

  app.get('/test/cookies', function (req, res) {
    res.json({
      email: req.cookies.email,
      password: req.cookies.password
    });
  });

  app.delete('/test/del-session', function (req, res) {
    req.session.destroy();
    res.json({});
  });
});

before(function (done) {
  init.run(done);
});

before(function () {
  express2.listen();
});

describe("login", function () {
  it("should success", function (done) {
    var form = { email: userf.user1.email, password: userf.user1.password };
    express2.post('/api/sessions').send(form).end(function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      should.not.exist(res.body.err);
      res.body.user.id.should.equal(userf.user1._id);
      res.body.user.name.should.equal(userf.user1.name);
      done();
    })
  });
  it("should fail with invalid email", function (done) {
    var form = { email: 'xxx@xxx.com', password: 'xxxx' };
    express2.post('/api/sessions').send(form).end(function (err, res) {
      res.error.should.false;
      should.exist(res.body.err);
      error.find(res.body.err, error.EMAIL_NOT_FOUND).should.true;
      done();
    })
  });
  it("should fail with invalid password", function (done) {
    var form = { email: userf.user1.email, password: 'xxxx' };
    express2.post('/api/sessions').send(form).end(function (err, res) {
      res.error.should.false;
      should.exist(res.body.err);
      error.find(res.body.err, error.PASSWORD_WRONG).should.true;
      done();
    })
  });
});

describe("accessing user resource", function () {
  it("given user session", function (done) {
    userf.loginUser1(done);
  });
  it("should success", function (done) {
    express2.get('/test/user').end(function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      should.not.exist(res.body.err);
      done();
    })
  });
  it("given no session", function (done) {
    userf.logout(done);
  });
  it("should fail", function (done) {
    express2.get('/test/user').end(function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      should.exist(res.body.err);
      error.find(res.body.err, error.NOT_AUTHENTICATED).should.true;
      done();
    })
  });
});

describe("accessing admin resource", function () {
  it("given admin session", function (done) {
    userf.loginAdmin(done);
  });
  it("should success", function (done) {
    express2.get('/test/admin').end(function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      should.not.exist(res.body.err);
      done();
    })
  });
  it("given no session", function (done) {
    userf.logout(done);
  });
  it("should fail", function (done) {
    express2.get('/test/admin').end(function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      should.exist(res.body.err);
      error.find(res.body.err, error.NOT_AUTHENTICATED).should.true;
      done();
    });
  });
  it("given user session", function (done) {
    userf.loginUser1(done);
  });
  it("should fail", function (done) {
    express2.get('/test/admin').end(function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      should.exist(res.body.err);
      error.find(res.body.err, error.NOT_AUTHORIZED).should.true;
      done();
    });
  });
});

describe("accessing user resouce ", function () {
  describe("with out auto login", function () {
    it("given new test session", function (done) {
      express2.newSession();
      done();
    });
    it("should fail", function (done) {
      express2.get('/test/user').end(function (err, res) {
        should.not.exist(err);
        res.error.should.false;
        should.exist(res.body.err);
        done();
      });
    });
    it("given user session", function (done) {
      userf.loginUser1(done);
    });
    it("should success", function (done) {
      express2.get('/test/user').end(function (err, res) {
        should.not.exist(err);
        res.error.should.false;
        should.not.exist(res.body.err);
        done();
      });
    });
    it("given new session", function (done) {
      express2.del('/test/del-session').end(function (err, res) {
        should.not.exist(err);
        res.error.should.false;
        should.not.exist(res.body.err);
        done();
      });
    });
    it("should fail", function (done) {
      express2.get('/test/user').end(function (err, res) {
        should.not.exist(err);
        res.error.should.false;
        should.exist(res.body.err);
        done();
      });
    });
  });
  describe("with auto login", function () {
    it("given new test sesssion",function (done) {
      express2.newSession();
      done();
    });
    it("should fail", function (done) {
      express2.get('/test/user').end(function (err, res) {
        should.not.exist(err);
        res.error.should.false;
        should.exist(res.body.err);
        done();
      });
    });
    it("given user session with auto login", function (done) {
      userf.loginUser1WithRemember(done);
    });
    it("should success", function (done) {
      express2.get('/test/user').end(function (err, res) {
        should.not.exist(err);
        res.error.should.false;
        should.not.exist(res.body.err);
        done();
      });
    });
    it("given new session", function (done) {
      express2.del('/test/del-session').end(function (err, res) {
        should.not.exist(err);
        res.error.should.false;
        should.not.exist(res.body.err);
        done();
      });
    });
    it("should success", function (done) {
      express2.get('/test/user').end(function (err, res) {
        should.not.exist(err);
        res.error.should.false;
        should.not.exist(res.body.err);
        done();
      });
    });
    it("given logged out", function (done) {
      userf.logout(done);
    });
    it("should fail", function (done) {
      express2.get('/test/user').end(function (err, res) {
        should.not.exist(err);
        res.error.should.false;
        should.exist(res.body.err);
        done();
      })
    });
  });
  describe("with auto login with invalid email", function () {
    it("given new test sesssion",function (done) {
      express2.newSession();
      done();
    });
    it("should fail", function (done) {
      express2.get('/test/user').end(function (err, res) {
        should.not.exist(err);
        res.error.should.false;
        should.exist(res.body.err);
        done();
      });
    });
    it("given user session with auto login", function (done) {
      userf.loginUser1WithRemember(done);
    });
    it("should success", function (done) {
      express2.get('/test/user').end(function (err, res) {
        should.not.exist(err);
        res.error.should.false;
        should.not.exist(res.body.err);
        done();
      });
    });
    it("checking email cookie", function (done) {
      express2.get('/test/cookies').end(function (err, res) {
        should.not.exist(err);
        res.error.should.false;
        should.not.exist(res.body.err);
        res.body.email.should.equal(userf.user1.email);
        done();
      });
    });
    it("given email changed", function (done) {
      var fields = {
        email: "new@def.com"
      };
      userb.users.update({ _id: userf.user1._id }, fields, function (err, cnt) {
        should.not.exist(err);
        cnt.should.true;
        done();
      });
    });
    it("given new session", function (done) {
      express2.del('/test/del-session').end(function (err, res) {
        should.not.exist(err);
        res.error.should.false;
        should.not.exist(res.body.err);
        done();
      });
    });
    it("should fail", function (done) {
      express2.get('/test/user').end(function (err, res) {
        should.not.exist(err);
        res.error.should.false;
        should.exist(res.body.err);
        done();
      });
    });
    it("checking email cookie is null", function (done) {
      express2.get('/test/cookies').end(function (err, res) {
        should.not.exist(err);
        res.error.should.false;
        should.not.exist(res.body.err);
        should.not.exist(res.body.email);
        done();
      });
    });
  });
});