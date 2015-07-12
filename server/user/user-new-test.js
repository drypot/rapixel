var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config')({ path: 'config/test.json' });
var mongop = require('../mongo/mongo')({ dropDatabase: true });
var exp = require('../express/express');
var userb = require('../user/user-base');
var usern = require('../user/user-new');
var local = require('../express/local');
var expect = require('../base/assert').expect;

before(function (done) {
  init.run(done);
});

describe('emailx test', function () {
  it('should success', function () {
    expect(usern.emailx.test('abc.mail.com')).false;
    expect(usern.emailx.test('abc*xyz@mail.com')).false;
    expect(usern.emailx.test('-a-b-c_d-e-f@mail.com')).true;
    expect(usern.emailx.test('develop.bj@mail.com')).true;
  });
});

describe('getNewId', function () {
  it('should work', function () {
    var id1 = userb.getNewId();
    var id1 = userb.getNewId();
    var id2 = userb.getNewId();
    var id2 = userb.getNewId();
    expect(id1 < id2).true;
  });
});

describe('creating user', function () {
  var _id;
  it('should success', function (done) {
    var form = { name: 'Name', email: 'name@mail.com', password: '1234' };
    local.post('/api/users').send(form).end(function (err,res) {
      expect(res.body.err).not.exist;
      _id = res.body.id;
      done();
    });
  });
  it('can be checked', function (done) {
    userb.users.findOne({ _id: _id }, function (err, user) {
      expect(err).not.exist;
      expect(user.name).equal('Name');
      expect(user.namel).equal('name');
      expect(user.home).equal('Name');
      expect(user.homel).equal('name');
      expect(user.email).equal('name@mail.com');
      expect(userb.checkPassword('1234', user.hash)).true;
      expect(userb.checkPassword('4444', user.hash)).false;
      done();
    });
  });
});

describe('name check', function () {
  var _id;
  before(function (done) {
    userb.users.deleteMany(done);
  });
  it('given Name1', function (done) {
    // 정규 create api 로는 home 이름을 세팅할 수 없기 때문에 디비에 직접 넣는다.
    var user = { _id: userb.getNewId(), name: 'Name1', namel: 'name1', home: 'Home1', homel: 'home1', email: 'name1@mail.com' };
    userb.users.insertOne(user, done);
  });
  it('duped NAME1 should fail', function (done) {
    var form = { name: 'NAME1', email: 'mail1@mail.com', password: '1234' };
    local.post('/api/users').send(form).end(function (err,res) {
      expect(res.body.err).exist;
      expect(res.body.err).error('NAME_DUPE');
      done();
    });
  });
  it('duped HOME1 should fail', function (done) {
    var form = { name: 'HOME1', email: 'mail2@mail.com', password: '1234' };
    local.post('/api/users').send(form).end(function (err,res) {
      expect(res.body.err).exist;
      expect(res.body.err).error('NAME_DUPE');
      done();
    });
  });
  it('length 2 name should success', function (done) {
    var form = { name: '12', email: 'mail3@mail.com', password: '1234' };
    local.post('/api/users').send(form).end(function (err,res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it('length 32 name should success', function (done) {
    var form = { name: '12345678901234567890123456789012', email: 'mail4@mail.com', password: '1234' };
    local.post('/api/users').send(form).end(function (err,res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it('empty name should fail', function (done) {
    var form = { name: '', email: 'mail5@mail.com', password: '1234' };
    local.post('/api/users').send(form).end(function (err,res) {
      expect(err).not.exist;
      expect(res.body.err).error('NAME_EMPTY');
      done();
    });
  });
  it('length 1 name should fail', function (done) {
    var form = { name: 'a', email: 'mail6@mail.com', password: '1234' };
    local.post('/api/users').send(form).end(function (err,res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      expect(res.body.err).error('NAME_RANGE');
      done();
    });
  });
  it('long name should fail', function (done) {
    var form = { name: '123456789012345678901234567890123', email: 'mail7@mail.com', password: '1234' };
    local.post('/api/users').send(form).end(function (err,res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      expect(res.body.err).error('NAME_RANGE');
      done();
    });
  });
});

describe('email check', function () {
  before(function (done) {
    userb.users.deleteMany(done);
  });
  it('given mail1@mail.com', function (done) {
    var form = { name: 'name1', email: 'mail1@mail.com', password: '1234' };
    local.post('/api/users').send(form).end(function (err,res) {
      expect(res.body.err).not.exist;
      done();
    });
  });
  it('duped mail1@mail.com should fail', function (done) {
    var form = { name: 'name2', email: 'mail1@mail.com', password: '1234' };
    local.post('/api/users').send(form).end(function (err,res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      expect(res.body.err).error('EMAIL_DUPE');
      done();
    });
  });
  it('different case should success', function (done) {
    var form = { name: 'name3', email: 'Mail1@mail.com', password: '1234' };
    local.post('/api/users').send(form).end(function (err,res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it('invalid email should fail', function (done) {
    var form = { name: 'name4', email: 'abc.mail.com', password: '1234' };
    local.post('/api/users').send(form).end(function (err,res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      expect(res.body.err).error('EMAIL_PATTERN');
      done();
    });
  });
  it('invalid email should fail', function (done) {
    var form = { name: 'name5', email: 'abc*xyz@mail.com', password: '1234' };
    local.post('/api/users').send(form).end(function (err,res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      expect(res.body.err).error('EMAIL_PATTERN');
      done();
    });
  });
  it('dash should success', function (done) {
    var form = { name: 'name6', email: '-a-b-c_d-e-f@mail.com', password: '1234' };
    local.post('/api/users').send(form).end(function (err,res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it('+ should success', function (done) {
    var form = { name: 'name7', email: 'abc+xyz@mail.com', password: '1234' };
    local.post('/api/users').send(form).end(function (err,res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
});

describe('password check', function () {
  var _id;
  before(function (done) {
    userb.users.deleteMany(done);
  });
  it('short password should fail', function (done) {
    var form = { name: 'name1', email: 'name1@mail.com', password: '123' };
    local.post('/api/users').send(form).end(function (err,res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      expect(res.body.err).error('PASSWORD_RANGE');
      done();
    });
  });
  it('long password should fail', function (done) {
    var form = { name: 'name2', email: 'name2@mail.com', password: '123456789012345678901234567890123' };
    local.post('/api/users').send(form).end(function (err,res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      expect(res.body.err).error('PASSWORD_RANGE');
      done();
    });
  });
  it('lenth 32 password should success', function (done) {
    var form = { name: 'name3', email: 'name3@mail.com', password: '12345678901234567890123456789012' };
    local.post('/api/users').send(form).end(function (err,res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
});

