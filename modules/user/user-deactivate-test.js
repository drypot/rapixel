var should = require('should');

var init = require('../base/init');
var error = require('../error/error');
var config = require('../config/config')({ path: 'config/rapixel-test.json' });
var mongo = require('../mongo/mongo')({ dropDatabase: true });
var express = require('../express/express');
var userb = require('../user/user-base');
var usera = require('../user/user-auth');
var userf = require('../user/user-fixture');
var userd = require('../user/user-deactivate');

init.add(function () {
  var app = express.app;

  app.get('/test/user', function (req, res) {
    usera.getUser(res, function (err, user) {
      if (err) return res.jsonErr(err);
      res.json({});
    });
  });
});

before(function (done) {
  init.run(done);
});

before(function () {
  express.listen();
});

describe("deactivating self", function () {
  it("given user1 login", function (done) {
    userf.loginUser1(done);
  });
  it("should success accessing user resource", function (done) {
    express.get('/test/user').end(function (err, res) {
      should(!err);
      should(!res.error);
      should(!res.body.err);
      done();
    })
  });
  it("should success deactivating user1", function (done) {
    express.del('/api/users/' + userf.user1._id).end(function (err, res) {
      should(!res.error);
      should(!res.body.err);
      done();
    });
  });
  it("can be checked", function (done) {
    userb.users.findOne({ _id: userf.user1._id }, function (err, user) {
      should(!err);
      should(user.status == 'd');
      done();
    });
  });
  it("should fail accessing user resource (because logged out)", function (done) {
    express.get('/test/user').end(function (err, res) {
      should(!res.error);
      should(res.body.err);
      should(error.find(res.body.err, error.NOT_AUTHENTICATED));
      done();
    });
  });
});

describe("deactivating with no login", function () {
  it("given no login", function (done) {
    userf.logout(done);
  });
  it("should fail deactivating user2", function (done) {
    express.del('/api/users/' + userf.user2._id).end(function (err, res) {
      should(!res.error);
      should(res.body.err);
      should(error.find(res.body.err, error.NOT_AUTHENTICATED));
      done();
    });
  });
});

describe("deactivating other", function () {
  it("given user2 login", function (done) {
    userf.loginUser2(done);
  });
  it("should fail deactivating user3", function (done) {
    express.del('/api/users/' + userf.user3._id).end(function (err, res) {
      should(!res.error);
      should(res.body.err);
      should(error.find(res.body.err, error.NOT_AUTHORIZED));
      done();
    });
  });
});

describe("deactivating by admin", function () {
  it("given admin login", function (done) {
    userf.loginAdmin(done);
  });
  it("should success deactivating user3", function (done) {
    express.del('/api/users/' + userf.user3._id).end(function (err, res) {
      should(!res.error);
      should(!res.body.err);
      done();
    });
  });
});

