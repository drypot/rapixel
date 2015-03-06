var should = require('should');

var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config')({ path: 'config/rapixel-test.json' });
var mongo = require('../mongo/mongo')({ dropDatabase: true });
var express2 = require('../main/express');
var userb = require('../user/user-base');
var userc = require('../user/user-create');

var local = require('../main/local');

before(function (done) {
  init.run(done);
});

before(function (done) {
  var users = [
    { _id: userb.newId(), name: 'Name1', namel: 'name1', home: 'Home1', homel: 'home1', email: 'mail1@mail.com' }
  ];
  userb.users.insert(users, done);
});

describe("emailx", function () {
  it("should success", function () {
    userc.emailx.test("abc.mail.com").should.false;
    userc.emailx.test("abc*xyz@mail.com").should.false;
    userc.emailx.test("-a-b-c_d-e-f@mail.com").should.true;
    userc.emailx.test("develop.bj@mail.com").should.true;
  });
});

describe("newId", function () {
  it("should success", function () {
    var id1 = userb.newId();
    var id1 = userb.newId();
    var id2 = userb.newId();
    var id2 = userb.newId();
    (id1 < id2).should.true;
  });
});

describe("creating user / name check", function () {
  it("shoud success", function (done) {
    var form = { name: 'NameTest', email: 'nametest@mail.com', password: '1234' };
    local.post('/api/users').send(form).end(function (err,res) {
      should.not.exist(res.body.err);
      done();
    });
  });
  it("can be checked", function (done) {
    userb.users.findOne({ email: 'nametest@mail.com' }, function (err, user) {
      should.not.exist(err);
      user.name.should.equal('NameTest');
      user.namel.should.equal('nametest');
      user.home.should.equal('NameTest');
      user.homel.should.equal('nametest');
      done();
    });
  });
  it("shoud success with another name", function (done) {
    var form = { name: 'NameTest2', email: 'nametest2@mail.com', password: '1234' };
    local.post('/api/users').send(form).end(function (err,res) {
      should.not.exist(res.body.err);
      done();
    });
  });
  it("should fail with same name to name", function (done) {
    var form = { name: 'NAME1', email: 'nametest9837@mail.com', password: '1234' };
    local.post('/api/users').send(form).end(function (err,res) {
      should.exist(res.body.err);
      error.find(res.body.err, error.NAME_DUPE).should.true;
      done();
    });
  });
  it("should fail with same name to home", function (done) {
    var form = { name: 'HOME1', email: 'nametest4329@mail.com', password: '1234' };
    local.post('/api/users').send(form).end(function (err,res) {
      should.exist(res.body.err);
      error.find(res.body.err, error.NAME_DUPE).should.true;
      done();
    });
  });
  it("should success when name length 2", function (done) {
    var form = { name: '12', email: 'nametest4783@mail.com', password: '1234' };
    local.post('/api/users').send(form).end(function (err,res) {
      res.error.should.false;
      should.not.exist(res.body.err);
      should.exist(res.body.id);
      done();
    });
  });
  it("should success when name length 32", function (done) {
    var form = { name: '12345678901234567890123456789012', email: 'nametest9928@mail.com', password: '1234' };
    local.post('/api/users').send(form).end(function (err,res) {
      res.error.should.false;
      should.not.exist(res.body.err);
      done();
    });
  });
  it("should fail when name empty", function (done) {
    var form = { name: '', email: 'nametest2243@mail.com', password: '1234' };
    local.post('/api/users').send(form).end(function (err,res) {
      res.error.should.false;
      error.find(res.body.err, error.NAME_EMPTY).should.true;
      done();
    });
  });
  it("should fail when name short", function (done) {
    var form = { name: 'a', email: 'nametest3492@mail.com', password: '1234' };
    local.post('/api/users').send(form).end(function (err,res) {
      res.error.should.false;
      should.exist(res.body.err);
      error.find(res.body.err, error.NAME_RANGE).should.true;
      done();
    });
  });
  it("should fail when name long", function (done) {
    var form = { name: '123456789012345678901234567890123', email: 'nametest7762@mail.com', password: '1234' };
    local.post('/api/users').send(form).end(function (err,res) {
      res.error.should.false;
      should.exist(res.body.err);
      error.find(res.body.err, error.NAME_RANGE).should.true;
      done();
    });
  });
});

describe("creating user / email check", function () {
  it("should success", function (done) {
    var form = { name: 'mailtest', email: 'mailtest1@mail.com', password: '1234' };
    local.post('/api/users').send(form).end(function (err,res) {
      res.error.should.false;
      should.not.exist(res.body.err);
      done();
    });
  });
  it("should fail with same email", function (done) {
    var form = { name: 'mailtest8724', email: 'mail1@mail.com', password: '1234' };
    local.post('/api/users').send(form).end(function (err,res) {
      res.error.should.false;
      should.exist(res.body.err);
      error.find(res.body.err, error.EMAIL_DUPE).should.true;
      done();
    });
  });
  it("should success with different case", function (done) {
    var form = { name: 'mailtest0098', email: 'Mail1@mail.com', password: '1234' };
    local.post('/api/users').send(form).end(function (err,res) {
      res.error.should.false;
      should.not.exist(res.body.err);
      done();
    });
  });
  it("should fail when email invalid", function (done) {
    var form = { name: 'mailtest9938', email: 'abc.mail.com', password: '1234' };
    local.post('/api/users').send(form).end(function (err,res) {
      res.error.should.false;
      should.exist(res.body.err);
      error.find(res.body.err, error.EMAIL_PATTERN).should.true;
      done();
    });
  });
  it("should fail when email invalid", function (done) {
    var form = { name: 'mailtest2342', email: 'abc*xyz@mail.com', password: '1234' };
    local.post('/api/users').send(form).end(function (err,res) {
      res.error.should.false;
      should.exist(res.body.err);
      error.find(res.body.err, error.EMAIL_PATTERN).should.true;
      done();
    });
  });
  it("should success with dash", function (done) {
    var form = { name: 'mailtest1124', email: '-a-b-c_d-e-f@mail.com', password: '1234' };
    local.post('/api/users').send(form).end(function (err,res) {
      res.error.should.false;
      should.not.exist(res.body.err);
      done();
    });
  });
  it("should success with +", function (done) {
    var form = { name: 'mailtest5836', email: 'abc+xyz@mail.com', password: '1234' };
    local.post('/api/users').send(form).end(function (err,res) {
      res.error.should.false;
      should.not.exist(res.body.err);
      done();
    });
  });
});

describe("creating user / password check", function () {
  it("should success", function (done) {
    var form = { name: 'passtest3847', email: 'passtest3847@mail.com', password: '1234' };
    local.post('/api/users').send(form).end(function (err,res) {
      should.not.exist(res.body.err);
      done();
    });
  });
  it("can be checked", function (done) {
    userb.users.findOne({ email: 'passtest3847@mail.com' }, function (err, user) {
      should.not.exist(err);
      user.name.should.equal('passtest3847');
      userc.checkPassword('1234', user.hash).should.true;
      userc.checkPassword('4444', user.hash).should.false;
      done();
    });
  });
  it("should fail when password short", function (done) {
    var form = { name: 'passtet8792', email: 'passtet8792@mail.com', password: '123' };
    local.post('/api/users').send(form).end(function (err,res) {
      res.error.should.false;
      should.exist(res.body.err);
      error.find(res.body.err, error.PASSWORD_RANGE).should.true;
      done();
    });
  });
  it("should fail when password long", function (done) {
    var form = { name: 'passtest9909', email: 'passtest9909@mail.com', password: '123456789012345678901234567890123' };
    local.post('/api/users').send(form).end(function (err,res) {
      res.error.should.false;
      should.exist(res.body.err);
      error.find(res.body.err, error.PASSWORD_RANGE).should.true;
      done();
    });
  });
  it("should success when password 32", function (done) {
    var form = { name: 'passtest3344', email: 'passtest3344@mail.com', password: '12345678901234567890123456789012' };
    local.post('/api/users').send(form).end(function (err,res) {
      res.error.should.false;
      should.not.exist(res.body.err);
      done();
    });
  });
});

