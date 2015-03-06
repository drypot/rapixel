var should = require('should');

var init = require('../base/init');
var error = require('../error/error');
var config = require('../config/config')({ path: 'config/rapixel-test.json' });
var mongo = require('../mongo/mongo')({ dropDatabase: true });
var express = require('../express/express');
var userb = require('../user/user-base');
var usera = require('../user/user-auth');
var userf = require('../user/user-fixture');

init.add(function () {
  var app = express.app;

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
  express.listen();
});

describe("login", function () {
  it("should success", function (done) {
    var form = { email: userf.user1.email, password: userf.user1.password };
    express.post('/api/sessions').send(form).end(function (err, res) {
      should(!err);
      should(!res.error);
      should(!res.body.err);
      res.body.user.id.should.equal(userf.user1._id);
      res.body.user.name.should.equal(userf.user1.name);
      done();
    })
  });
  it("should fail with invalid email", function (done) {
    var form = { email: 'xxx@xxx.com', password: 'xxxx' };
    express.post('/api/sessions').send(form).end(function (err, res) {
      should(!res.error);
      should(res.body.err);
      should(error.find(res.body.err, error.EMAIL_NOT_FOUND));
      done();
    })
  });
  it("should fail with invalid password", function (done) {
    var form = { email: userf.user1.email, password: 'xxxx' };
    express.post('/api/sessions').send(form).end(function (err, res) {
      should(!res.error);
      should(res.body.err);
      should(error.find(res.body.err, error.PASSWORD_WRONG));
      done();
    })
  });
});

describe("accessing user resource", function () {
  it("given user session", function (done) {
    userf.loginUser1(done);
  });
  it("should success", function (done) {
    express.get('/test/user').end(function (err, res) {
      should(!err);
      should(!res.error);
      should(!res.body.err);
      done();
    })
  });
  it("given no session", function (done) {
    userf.logout(done);
  });
  it("should fail", function (done) {
    express.get('/test/user').end(function (err, res) {
      should(!err);
      should(!res.error);
      should(res.body.err);
      should(error.find(res.body.err, error.NOT_AUTHENTICATED))
      done();
    })
  });
});

describe("accessing admin resource", function () {
  it("given admin session", function (done) {
    userf.loginAdmin(done);
  });
  it("should success", function (done) {
    express.get('/test/admin').end(function (err, res) {
      should(!err);
      should(!res.error);
      should(!res.body.err);
      done();
    })
  });
  it("given no session", function (done) {
    userf.logout(done);
  });
  it("should fail", function (done) {
    express.get('/test/admin').end(function (err, res) {
      should(!err);
      should(!res.error);
      should(res.body.err);
      should(error.find(res.body.err, error.NOT_AUTHENTICATED))
      done();
    });
  });
  it("given user session", function (done) {
    userf.loginUser1(done);
  });
  it("should fail", function (done) {
    express.get('/test/admin').end(function (err, res) {
      should(!err);
      should(!res.error);
      should(res.body.err);
      should(error.find(res.body.err, error.NOT_AUTHORIZED))
      done();
    });
  });
});

describe("accessing user resouce ", function () {
  describe("with out auto login", function () {
    it("given new test session", function (done) {
      express.resetTestSession();
      done();
    });
    it("should fail", function (done) {
      express.get('/test/user').end(function (err, res) {
        should(!err);
        should(!res.error);
        should(res.body.err);
        done();
      });
    });
    it("given user session", function (done) {
      userf.loginUser1(done);
    });
    it("should success", function (done) {
      express.get('/test/user').end(function (err, res) {
        should(!err);
        should(!res.error);
        should(!res.body.err);
        done();
      });
    });
    it("given new session", function (done) {
      express.del('/test/del-session').end(function (err, res) {
        should(!err);
        should(!res.error);
        should(!res.body.err);
        done();
      });
    });
    it("should fail", function (done) {
      express.get('/test/user').end(function (err, res) {
        should(!err);
        should(!res.error);
        should(res.body.err);
        done();
      });
    });
  });
  describe("with auto login", function () {
    it("given new test sesssion",function (done) {
      express.resetTestSession();
      done();
    });
    it("should fail", function (done) {
      express.get('/test/user').end(function (err, res) {
        should(!err);
        should(!res.error);
        should(res.body.err);
        done();
      });
    });
    it("given user session with auto login", function (done) {
      userf.loginUser1WithRemember(done);
    });
    it("should success", function (done) {
      express.get('/test/user').end(function (err, res) {
        should(!err);
        should(!res.error);
        should(!res.body.err);
        done();
      });
    });
    it("given new session", function (done) {
      express.del('/test/del-session').end(function (err, res) {
        should(!err);
        should(!res.error);
        should(!res.body.err);
        done();
      });
    });
    it("should success", function (done) {
      express.get('/test/user').end(function (err, res) {
        should(!err);
        should(!res.error);
        should(!res.body.err);
        done();
      });
    });
    it("given logged out", function (done) {
      userf.logout(done);
    });
    it("should fail", function (done) {
      express.get('/test/user').end(function (err, res) {
        should(!err);
        should(!res.error);
        should(res.body.err);
        done();
      })
    });
  });
  describe("with auto login with invalid email", function () {
    it("given new test sesssion",function (done) {
      express.resetTestSession();
      done();
    });
    it("should fail", function (done) {
      express.get('/test/user').end(function (err, res) {
        should(!err);
        should(!res.error);
        should(res.body.err);
        done();
      });
    });
    it("given user session with auto login", function (done) {
      userf.loginUser1WithRemember(done);
    });
    it("should success", function (done) {
      express.get('/test/user').end(function (err, res) {
        should(!err);
        should(!res.error);
        should(!res.body.err);
        done();
      });
    });
    it("checking email cookie", function (done) {
      express.get('/test/cookies').end(function (err, res) {
        should(!err);
        should(!res.error);
        should(!res.body.err);
        res.body.email.should.equal(userf.user1.email);
        done();
      });
    });
    it("given email changed", function (done) {
      var fields = {
        email: "new@def.com"
      };
      userb.users.update({ _id: userf.user1._id }, fields, function (err, cnt) {
        should(!err);
        should(cnt);
        done();
      });
    });
    it("given new session", function (done) {
      express.del('/test/del-session').end(function (err, res) {
        should(!err);
        should(!res.error);
        should(!res.body.err);
        done();
      });
    });
    it("should fail", function (done) {
      express.get('/test/user').end(function (err, res) {
        should(!err);
        should(!res.error);
        should(res.body.err);
        done();
      });
    });
    it("checking email cookie is null", function (done) {
      express.get('/test/cookies').end(function (err, res) {
        should(!err);
        should(!res.error);
        should(!res.body.err);
        should(!res.body.email);
        done();
      });
    });
  });
});