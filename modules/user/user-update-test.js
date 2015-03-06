var should = require('should');
var bcrypt = require('bcrypt');

var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config')({ path: 'config/rapixel-test.json' });
var mongo = require('../mongo/mongo')({ dropDatabase: true });
var express2 = require('../main/express');
var userb = require('../user/user-base');
var userc = require('../user/user-create');
var userv = require('../user/user-view');
var useru = require('../user/user-update');
var userf = require('../user/user-fixture');

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

describe("updating user / permission", function () {
  var _user = { name: 'testauth', email: 'testauth@mail.com', password: '1234' };
  it("given new user", function (done) {
    local.post('/api/users').send(_user).end(function (err,res) {
      res.error.should.false;
      should.not.exist(res.body.err);
      _user._id = res.body.id;
      done();
    });
  });
  it("given new user login", function (done) {
    var form = { email: _user.email, password: _user.password };
    local.post('/api/sessions').send(form).end(function (err, res) {
      res.error.should.false;
      should.not.exist(res.body.err);
      done();
    });
  });
  it("should success updating own profile", function (done) {
    var form = { name: 'testauth', home: 'testauth', email: 'testauth@mail.com' };
    local.put('/api/users/' + _user._id).send(form).end(function (err,res) {
      res.error.should.false;
      should.not.exist(res.body.err);
      done();
    });
  });
  it("given user1 login", function (done) {
    userf.loginUser1(done);
  });
  it("should fail updating new user's profile", function (done) {
    var form = { name: 'testauth', home: 'testauth', email: 'testauth@mail.com' };
    local.put('/api/users/' + _user._id).send(form).end(function (err,res) {
      res.error.should.false;
      should.exist(res.body.err);
      error.find(res.body.err, error.NOT_AUTHORIZED).should.true;
      done();
    });
  });
  it("given admin login", function (done) {
    userf.loginAdmin(done);
  });
  it("should success updating anybody", function (done) {
    var form = { name: 'testauth', home: 'testauth', email: 'testauth@mail.com' };
    local.put('/api/users/' + _user._id).send(form).end(function (err,res) {
      res.error.should.false;
      should.not.exist(res.body.err);
      done();
    });
  });
  it("should fail for invalid id", function (done) {
    var form = { name: 'testauth3', home: 'testauth3', email: 'testauth3@mail.com' };
    local.put('/api/users/' + 999).send(form).end(function (err,res) {
      res.error.should.false;
      error.find(res.body.err, error.USER_NOT_FOUND).should.true;
      done();
    });
  });
});

describe("updating user / name", function () {
  var _user = { name: 'NameTest', email: 'nametest@mail.com', password: '1234' };
  it("given user", function (done) {
    local.post('/api/users').send(_user).end(function (err,res) {
      res.error.should.false;
      should.not.exist(res.body.err);
      _user._id = res.body.id;
      done();
    });
  });
  it("given login", function (done) {
    var form = { email: _user.email, password: _user.password };
    local.post('/api/sessions').send(form).end(function (err, res) {
      res.error.should.false;
      should.not.exist(res.body.err);
      done();
    });
  });
  it("should success", function (done) {
    var form = { name: 'NameTest-NEW', home: 'NameTest', email: 'nametest@mail.com', password: '1234' };
    local.put('/api/users/' + _user._id).send(form).end(function (err,res) {
      res.error.should.false;
      should.not.exist(res.body.err);
      done();
    });
  });
  it("can be checked", function (done) {
    userb.users.findOne({ _id: _user._id }, function (err, user) {
      should.not.exist(err);
      should.exist(user);
      user.name.should.equal('NameTest-NEW');
      user.namel.should.equal('nametest-new');
      done();
    });
  });
  it("should fail with same name to name", function (done) {
    var form = { name: 'NAME1', home: 'NameTest', email: 'nametest@mail.com', password: '1234' };
    local.put('/api/users/' + _user._id).send(form).end(function (err,res) {
      res.error.should.false;
      should.exist(res.body.err);
      error.find(res.body.err, error.NAME_DUPE).should.true;
      done();
    });
  });
  it("should fail with same name to home", function (done) {
    var form = { name: 'HOME1', home: 'NameTest', email: 'nametest@mail.com', password: '1234' };
    local.put('/api/users/' + _user._id).send(form).end(function (err,res) {
      res.error.should.false;
      should.exist(res.body.err);
      error.find(res.body.err, error.NAME_DUPE).should.true;
      done();
    });
  });
  it("should fail when name empty", function (done) {
    var form = { name: '', home: 'NameTest', email: 'nametest@mail.com', password: '1234' };
    local.put('/api/users/' + _user._id).send(form).end(function (err,res) {
      res.error.should.false;
      error.find(res.body.err, error.NAME_EMPTY).should.true;
      done();
    });
  });
  it("should fail when name short", function (done) {
    var form = { name: 'u', home: 'NameTest', email: 'nametest@mail.com', password: '1234' };
    local.put('/api/users/' + _user._id).send(form).end(function (err,res) {
      res.error.should.false;
      error.find(res.body.err, error.NAME_RANGE).should.true;
      done();
    });
  });
  it("should success when name length 2", function (done) {
    var form = { name: 'uu', home: 'NameTest', email: 'nametest@mail.com', password: '1234' };
    local.put('/api/users/' + _user._id).send(form).end(function (err,res) {
      res.error.should.false;
      should.not.exist(res.body.err);
      done();
    });
  });
  it("should fail when name long", function (done) {
    var form = { name: '123456789012345678901234567890123', home: 'NameTest', email: 'nametest@mail.com', password: '1234' };
    local.put('/api/users/' + _user._id).send(form).end(function (err,res) {
      res.error.should.false;
      error.find(res.body.err, error.NAME_RANGE).should.true;
      done();
    });
  });
  it("should success when name length 32", function (done) {
    var form = { name: '12345678901234567890123456789012', home: 'NameTest', email: 'nametest@mail.com', password: '1234' };
    local.put('/api/users/' + _user._id).send(form).end(function (err,res) {
      res.error.should.false;
      should.not.exist(res.body.err);
      done();
    });
  });
});

describe("updating user / home", function () {
  var _user = { name: 'HomeTest', email: 'hometest@mail.com', password: '1234' };
  it("given new user", function (done) {
    local.post('/api/users').send(_user).end(function (err,res) {
      res.error.should.false;
      should.not.exist(res.body.err);
      _user._id = res.body.id;
      done();
    });
  });
  it("given login", function (done) {
    var form = { email: _user.email, password: _user.password };
    local.post('/api/sessions').send(form).end(function (err, res) {
      res.error.should.false;
      should.not.exist(res.body.err);
      done();
    });
  });
  it("should success", function (done) {
    var form = { name: 'HomeTest', home: 'HomeTest-NEW', email: 'hometest@mail.com', password: '1234' };
    local.put('/api/users/' + _user._id).send(form).end(function (err,res) {
      res.error.should.false;
      should.not.exist(res.body.err);
      done();
    });
  });
  it("can be checked", function (done) {
    userb.users.findOne({ _id: _user._id }, function (err, user) {
      should.not.exist(err);
      should.exist(user);
      user.name.should.equal('HomeTest');
      user.home.should.equal('HomeTest-NEW');
      user.homel.should.equal('hometest-new');
      done();
    });
  });
  it("should fail with same home to home", function (done) {
    var form = { name: 'HomeTest', home: 'HOME1', email: 'hometest@mail.com', password: '1234' };
    local.put('/api/users/' + _user._id).send(form).end(function (err,res) {
      res.error.should.false;
      should.exist(res.body.err);
      error.find(res.body.err, error.HOME_DUPE).should.true;
      done();
    });
  });
  it("should fail with same home to name", function (done) {
    var form = { name: 'HomeTest', home: 'NAME1', email: 'hometest@mail.com', password: '1234' };
    local.put('/api/users/' + _user._id).send(form).end(function (err,res) {
      res.error.should.false;
      should.exist(res.body.err);
      error.find(res.body.err, error.HOME_DUPE).should.true;
      done();
    });
  });
  it("should fail when home empty", function (done) {
    var form = { name: 'HomeTest', home: '', email: 'hometest@mail.com', password: '1234' };
    local.put('/api/users/' + _user._id).send(form).end(function (err,res) {
      res.error.should.false;
      error.find(res.body.err, error.HOME_EMPTY).should.true;
      done();
    });
  });
  it("should fail when home short", function (done) {
    var form = { name: 'HomeTest', home: 'h', email: 'hometest@mail.com', password: '1234' };
    local.put('/api/users/' + _user._id).send(form).end(function (err,res) {
      res.error.should.false;
      error.find(res.body.err, error.HOME_RANGE).should.true;
      done();
    });
  });
  it("should success when home length 2", function (done) {
    var form = { name: 'HomeTest', home: 'hh', email: 'hometest@mail.com', password: '1234' };
    local.put('/api/users/' + _user._id).send(form).end(function (err,res) {
      res.error.should.false;
      should.not.exist(res.body.err);
      done();
    });
  });
  it("should fail when home long", function (done) {
    var form = { name: 'HomeTest', home: '123456789012345678901234567890123', email: 'hometest@mail.com', password: '1234' };
    local.put('/api/users/' + _user._id).send(form).end(function (err,res) {
      res.error.should.false;
      error.find(res.body.err, error.HOME_RANGE).should.true;
      done();
    });
  });
  it("should success when home length 32", function (done) {
    var form = { name: 'HomeTest', home: '1234567890123456789012345678901H', email: 'hometest@mail.com', password: '1234' };
    local.put('/api/users/' + _user._id).send(form).end(function (err,res) {
      res.error.should.false;
      should.not.exist(res.body.err);
      done();
    });
  });
});

describe("updating user / email", function () {
  var _user = { name: 'mailtest', email: 'mailtest@mail.com', password: '1234' };
  it("given new user", function (done) {
    local.post('/api/users').send(_user).end(function (err,res) {
      should.not.exist(err);
      res.error.should.false;
      should.not.exist(res.body.err);
      _user._id = res.body.id;
      done();
    });
  });
  it("given login", function (done) {
    var form = { email: _user.email, password: _user.password };
    local.post('/api/sessions').send(form).end(function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      should.not.exist(res.body.err);
      done();
    });
  });
  it("should success", function (done) {
    var form = { name: 'mailtest', home: 'mailtest', email: 'mailtest-new@mail.com', password: '1234' };
    local.put('/api/users/' + _user._id).send(form).end(function (err,res) {
      res.error.should.false;
      should.not.exist(res.body.err);
      done();
    });
  });
  it("can be checked", function (done) {
    userb.users.findOne({ _id: _user._id }, function (err, user) {
      should.not.exist(err);
      should.exist(user);
      user.email.should.equal('mailtest-new@mail.com');
      done();
    });
  });
  it("should fail when already exists", function (done) {
    var form = { name: 'mailtest', home: 'mailtest', email: 'mail1@mail.com', password: '1234' };
    local.put('/api/users/' + _user._id).send(form).end(function (err,res) {
      res.error.should.false;
      error.find(res.body.err, error.EMAIL_DUPE).should.true;
      done();
    });
  });
  it("should fail when email invalid", function (done) {
    var form = { name: 'mailtest', home: 'mailtest', email: 'abc.mail.com', password: '1234' };
    local.put('/api/users/' + _user._id).send(form).end(function (err,res) {
      res.error.should.false;
      error.find(res.body.err, error.EMAIL_PATTERN).should.true;
      done();
    });
  });
});

describe("updating user / password", function () {
  var _user = { name: 'pwtest', email: 'pwtest@mail.com', password: '1234' };
  it("given new user", function (done) {
    local.post('/api/users').send(_user).end(function (err,res) {
      res.error.should.false;
      should.not.exist(res.body.err);
      _user._id = res.body.id;
      done();
    });
  });
  it("given login", function (done) {
    var form = { email: _user.email, password: _user.password };
    local.post('/api/sessions').send(form).end(function (err, res) {
      res.error.should.false;
      should.not.exist(res.body.err);
      done();
    });
  });
  it("should success", function (done) {
    var form = { name: 'pwtest', home: 'pwtest', email: 'pwtest@mail.com', password: '5678' };
    local.put('/api/users/' + _user._id).send(form).end(function (err,res) {
      res.error.should.false;
      should.not.exist(res.body.err);
      done();
    });
  });
  it("can be checked", function (done) {
    userb.users.findOne({ _id: _user._id }, function (err, user) {
      should.not.exist(err);
      should.exist(user);
      bcrypt.compareSync('5678', user.hash).should.true;
      done();
    });
  });
  it("should success when password emtpy", function (done) {
    var form = { name: 'pwtest', home: 'pwtest', email: 'pwtest@mail.com' };
    local.put('/api/users/' + _user._id).send(form).end(function (err,res) {
      res.error.should.false;
      should.not.exist(res.body.err);
      done();
    });
  });
  it("can be checked", function (done) {
    userb.users.findOne({ _id: _user._id }, function (err, user) {
      should.not.exist(err);
      should.exist(user);
      bcrypt.compareSync('5678', user.hash).should.true;
      done();
    });
  });
  it("should fail when password short", function (done) {
    var form = { name: 'pwtest', home: 'pwtest', email: 'pwtest@mail.com', password: '123' };
    local.put('/api/users/' + _user._id).send(form).end(function (err,res) {
      res.error.should.false;
      error.find(res.body.err, error.PASSWORD_RANGE).should.true;
      done();
    });
  });
  it("should fail when password long", function (done) {
    var form = { name: 'pwtest', home: 'pwtest', email: 'pwtest@mail.com', password: '123456789012345678901234567890123' };
    local.put('/api/users/' + _user._id).send(form).end(function (err,res) {
      res.error.should.false;
      error.find(res.body.err, error.PASSWORD_RANGE).should.true;
      done();
    });
  });
  it("should success when password 32", function (done) {
    var form = { name: 'pwtest', home: 'pwtest', email: 'pwtest@mail.com', password: '12345678901234567890123456789012' };
    local.put('/api/users/' + _user._id).send(form).end(function (err,res) {
      res.error.should.false;
      should.not.exist(res.body.err);
      done();
    });
  });
});

describe("updating user / profile", function () {
  var _user = { name: 'pftest', email: 'pftest@mail.com', password: '1234', profile: 'profile' };
  it("given new user", function (done) {
    local.post('/api/users').send(_user).end(function (err,res) {
      res.error.should.false;
      should.not.exist(res.body.err);
      _user._id = res.body.id;
      done();
    });
  });
  it("given login", function (done) {
    var form = { email: _user.email, password: _user.password };
    local.post('/api/sessions').send(form).end(function (err, res) {
      res.error.should.false;
      should.not.exist(res.body.err);
      done();
    });
  });
  it("should success", function (done) {
    var form = { name: 'pftest', home: 'pftest', email: 'pftest@mail.com', profile: 'profile-new' };
    local.put('/api/users/' + _user._id).send(form).end(function (err,res) {
      res.error.should.false;
      should.not.exist(res.body.err);
      done();
    });
  });
  it("can be checked", function (done) {
    userb.users.findOne({ _id: _user._id }, function (err, user) {
      should.not.exist(err);
      should.exist(user);
      user.profile.should.equal('profile-new');
      done();
    });
  });
});

describe("updating user / cache", function () {
  var _user = { name: 'cachetest', email: 'cachetest@mail.com', password: '1234' };
  it("given new user", function (done) {
    local.post('/api/users').send(_user).end(function (err,res) {
      res.error.should.false;
      should.not.exist(res.body.err);
      _user._id = res.body.id;
      done();
    });
  });
  it("given login", function (done) {
    var form = { email: _user.email, password: _user.password };
    local.post('/api/sessions').send(form).end(function (err, res) {
      res.error.should.false;
      should.not.exist(res.body.err);
      done();
    });
  });
  it("check cache before update", function (done) {
    userv.getCached(_user._id, function (err, user) {
      should.not.exist(err);
      user.name.should.equal('cachetest');
      user.home.should.equal('cachetest');
      user.email.should.equal('cachetest@mail.com');
      done();
    });
  });
  it("should success", function (done) {
    var form = { name: 'cachetest-new', home: 'home-new', email: 'cachetest-new@mail.com' };
    local.put('/api/users/' + _user._id).send(form).end(function (err,res) {
      res.error.should.false;
      should.not.exist(res.body.err);
      done();
    });
  });
  it("check cache after update", function (done) {
    userv.getCached(_user._id, function (err, user) {
      should.not.exist(err);
      user.name.should.equal('cachetest-new');
      user.home.should.equal('home-new');
      user.email.should.equal('cachetest-new@mail.com');
      done();
    });
  });
});

