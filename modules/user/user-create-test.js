var chai = require('chai');
var expect = chai.expect;
chai.use(require('chai-http'));
chai.config.includeStack = true;

var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config')({ path: 'config/test.json' });
var mongo = require('../mongo/mongo')({ dropDatabase: true });
var express2 = require('../main/express');
var userb = require('../user/user-base');
var userc = require('../user/user-create');

var local = require('../main/local');

before(function (done) {
  init.run(done);
});

describe("emailx test", function () {
  it("should success", function () {
    expect(userc.emailx.test("abc.mail.com")).false;
    expect(userc.emailx.test("abc*xyz@mail.com")).false;
    expect(userc.emailx.test("-a-b-c_d-e-f@mail.com")).true;
    expect(userc.emailx.test("develop.bj@mail.com")).true;
  });
});

describe("newId", function () {
  it("should work", function () {
    var id1 = userb.newId();
    var id1 = userb.newId();
    var id2 = userb.newId();
    var id2 = userb.newId();
    expect(id1 < id2).true;
  });
});

describe("creating user / name check", function () {
  it("given Name1", function (done) {
    var form = { name: 'Name1', email: 'nametest9980@mail.com', password: '1234' };
    local.post('/api/users').send(form).end(function (err,res) {
      expect(res.body.err).not.exist;
      userb.users.findOne({ _id: res.body.id }, function (err, user) {
        expect(err).not.exist;
        expect(user.name).equal('Name1');
        expect(user.namel).equal('name1');
        expect(user.home).equal('Name1');
        expect(user.homel).equal('name1');
        var fields = {
          home: 'Home1',
          homel: 'home1',
        };
        userb.users.update({ _id: res.body.id }, { $set: fields }, function (err, cnt) {
          expect(err).not.exist;
          expect(cnt).above(0);
          done();
        });
      });
    });
  });
  it("duped NAME1 should fail", function (done) {
    var form = { name: 'NAME1', email: 'nametest9837@mail.com', password: '1234' };
    local.post('/api/users').send(form).end(function (err,res) {
      expect(res.body.err).exist;
      expect(error.find(res.body.err, error.NAME_DUPE)).true;
      done();
    });
  });
  it("duped HOME1 should fail", function (done) {
    var form = { name: 'HOME1', email: 'nametest4329@mail.com', password: '1234' };
    local.post('/api/users').send(form).end(function (err,res) {
      expect(res.body.err).exist;
      expect(error.find(res.body.err, error.NAME_DUPE)).true;
      done();
    });
  });
  it("length 2 name should success", function (done) {
    var form = { name: '12', email: 'nametest4783@mail.com', password: '1234' };
    local.post('/api/users').send(form).end(function (err,res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it("length 32 name should success", function (done) {
    var form = { name: '12345678901234567890123456789012', email: 'nametest9928@mail.com', password: '1234' };
    local.post('/api/users').send(form).end(function (err,res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it("empty name should fail", function (done) {
    var form = { name: '', email: 'nametest2243@mail.com', password: '1234' };
    local.post('/api/users').send(form).end(function (err,res) {
      expect(err).not.exist;
      expect(error.find(res.body.err, error.NAME_EMPTY)).true;
      done();
    });
  });
  it("length 1 name should fail", function (done) {
    var form = { name: 'a', email: 'nametest3492@mail.com', password: '1234' };
    local.post('/api/users').send(form).end(function (err,res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      expect(error.find(res.body.err, error.NAME_RANGE)).true;
      done();
    });
  });
  it("long name should fail", function (done) {
    var form = { name: '123456789012345678901234567890123', email: 'nametest7762@mail.com', password: '1234' };
    local.post('/api/users').send(form).end(function (err,res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      expect(error.find(res.body.err, error.NAME_RANGE)).true;
      done();
    });
  });
});

describe("creating user / email check", function () {
  it("given mail1@mail.com", function (done) {
    var form = { name: 'mailtest2084', email: 'mail1@mail.com', password: '1234' };
    local.post('/api/users').send(form).end(function (err,res) {
      expect(res.body.err).not.exist;
      done();
    });
  });
  it("duped mail1@mail.com should fail", function (done) {
    var form = { name: 'mailtest8724', email: 'mail1@mail.com', password: '1234' };
    local.post('/api/users').send(form).end(function (err,res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      expect(error.find(res.body.err, error.EMAIL_DUPE)).true;
      done();
    });
  });
  it("different case should success", function (done) {
    var form = { name: 'mailtest0098', email: 'Mail1@mail.com', password: '1234' };
    local.post('/api/users').send(form).end(function (err,res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it("invalid email should fail", function (done) {
    var form = { name: 'mailtest9938', email: 'abc.mail.com', password: '1234' };
    local.post('/api/users').send(form).end(function (err,res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      expect(error.find(res.body.err, error.EMAIL_PATTERN)).true;
      done();
    });
  });
  it("invalid email should fail", function (done) {
    var form = { name: 'mailtest2342', email: 'abc*xyz@mail.com', password: '1234' };
    local.post('/api/users').send(form).end(function (err,res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      expect(error.find(res.body.err, error.EMAIL_PATTERN)).true;
      done();
    });
  });
  it("dash should success", function (done) {
    var form = { name: 'mailtest1124', email: '-a-b-c_d-e-f@mail.com', password: '1234' };
    local.post('/api/users').send(form).end(function (err,res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it("+ should success", function (done) {
    var form = { name: 'mailtest5836', email: 'abc+xyz@mail.com', password: '1234' };
    local.post('/api/users').send(form).end(function (err,res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
});

describe("creating user / password check", function () {
  it("should success", function (done) {
    var form = { name: 'passtest3847', email: 'passtest3847@mail.com', password: '1234' };
    local.post('/api/users').send(form).end(function (err,res) {
      expect(res.body.err).not.exist;
      userb.users.findOne({ _id: res.body.id }, function (err, user) {
        expect(err).not.exist;
        expect(user.name).equal('passtest3847');
        expect(userb.checkPassword('1234', user.hash)).true;
        expect(userb.checkPassword('4444', user.hash)).false;
        done();
      });
    });
  });
  it("short password should fail", function (done) {
    var form = { name: 'passtet8792', email: 'passtet8792@mail.com', password: '123' };
    local.post('/api/users').send(form).end(function (err,res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      expect(error.find(res.body.err, error.PASSWORD_RANGE)).true;
      done();
    });
  });
  it("long password should fail", function (done) {
    var form = { name: 'passtest9909', email: 'passtest9909@mail.com', password: '123456789012345678901234567890123' };
    local.post('/api/users').send(form).end(function (err,res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      expect(error.find(res.body.err, error.PASSWORD_RANGE)).true;
      done();
    });
  });
  it("lenth 32 password should success", function (done) {
    var form = { name: 'passtest3344', email: 'passtest3344@mail.com', password: '12345678901234567890123456789012' };
    local.post('/api/users').send(form).end(function (err,res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
});

