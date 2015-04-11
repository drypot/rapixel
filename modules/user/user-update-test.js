var expect = require('../base/chai').expect;

var bcrypt = require('bcrypt');

var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config')({ path: 'config/test.json' });
var mongop = require('../mongo/mongo')({ dropDatabase: true });
var exp = require('../express/express');
var userb = require('../user/user-base');
var useru = require('../user/user-update');
var userf = require('../user/user-fixture');
var local = require('../express/local');

before(function (done) {
  init.run(done);
});

describe('updating user', function () {
  var _id;
  before(userf.recreate);
  it('given user', function (done) {
    var form = { name: 'Name', email: 'name@mail.com', password: '1234' };
    local.post('/api/users').send(form).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      _id = res.body.id;
      done();
    });
  });
  it('given login', function (done) {
    local.post('/api/users/login').send({ email: 'name@mail.com', password: '1234' }).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it('should success', function (done) {
    var form = { name: 'NewName', home: 'NewHome', email: 'new.name@mail.com', password: '5678', profile: 'new profile' };
    local.put('/api/users/' + _id).send(form).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it('can be checked', function (done) {
    userb.users.findOne({ _id: _id }, function (err, user) {
      expect(err).not.exist;
      expect(user.name).equal('NewName');
      expect(user.namel).equal('newname');
      expect(user.home).equal('NewHome');
      expect(user.homel).equal('newhome');
      expect(user.email).equal('new.name@mail.com');
      expect(userb.checkPassword('1234', user.hash)).false;
      expect(userb.checkPassword('5678', user.hash)).true;
      expect(user.profile).equal('new profile');
      done();
    });
  });
});

describe('permission', function () {
  before(userf.recreate);
  it('given user1 login', function (done) {
    userf.login('user1', done);
  });
  it('updating other\'s should fail', function (done) {
    var form = { name: 'NewName1', home: 'NewHome1', email: 'new.name1@mail.com', password: '5678' };
    local.put('/api/users/' + userf.user2._id).send(form).end(function (err,res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      expect(error.find(res.body.err, error.NOT_AUTHORIZED)).true;
      done();
    });
  });
  it('given admin login', function (done) {
    userf.login('admin', done);
  });
  it('updating anybody should success', function (done) {
    var form = { name: 'NewName2', home: 'NewHome2', email: 'new.name2@mail.com', password: '5678' };
    local.put('/api/users/' + userf.user2._id).send(form).end(function (err,res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it('invalid user id should fail', function (done) {
    var form = { name: 'NewName3', home: 'NewHome3', email: 'new.name3@mail.com', password: '5678' };
    local.put('/api/users/' + 999).send(form).end(function (err,res) {
      expect(err).not.exist;
      expect(error.find(res.body.err, error.USER_NOT_FOUND)).true;
      done();
    });
  });
});

describe('updating name', function () {
  before(userf.recreate);
  it('given user', function (done) {
    var user = { _id: userb.getNewId(), name: 'Name', namel: 'name', home: 'Home', homel: 'home', email: 'name@mail.com' };
    userb.users.insert(user, function (err) {
      expect(err).not.exist;
      done();
    });
  });
  it('given user1 login', function (done) {
    userf.login('user1', done);
  });
  it('duped name should fail', function (done) {
    var form = { name: 'NAME', home: 'Home1', email: 'name1@mail.com', password: '1234' };
    local.put('/api/users/' + userf.user1._id).send(form).end(function (err,res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      expect(error.find(res.body.err, error.NAME_DUPE)).true;
      done();
    });
  });
  it('duped with home should fail', function (done) {
    var form = { name: 'HOME', home: 'Home2', email: 'name2@mail.com', password: '1234' };
    local.put('/api/users/' + userf.user1._id).send(form).end(function (err,res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      expect(error.find(res.body.err, error.NAME_DUPE)).true;
      done();
    });
  });
  it('empty name should fail', function (done) {
    var form = { name: '', home: 'NameTest', email: 'nametest@mail.com', password: '1234' };
    local.put('/api/users/' + userf.user1._id).send(form).end(function (err,res) {
      expect(err).not.exist;
      expect(error.find(res.body.err, error.NAME_EMPTY)).true;
      done();
    });
  });
  it('short name should fail', function (done) {
    var form = { name: 'u', home: 'NameTest', email: 'nametest@mail.com', password: '1234' };
    local.put('/api/users/' + userf.user1._id).send(form).end(function (err,res) {
      expect(err).not.exist;
      expect(error.find(res.body.err, error.NAME_RANGE)).true;
      done();
    });
  });
  it('length 2 naem should success', function (done) {
    var form = { name: 'uu', home: 'NameTest', email: 'nametest@mail.com', password: '1234' };
    local.put('/api/users/' + userf.user1._id).send(form).end(function (err,res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it('name long should fail', function (done) {
    var form = { name: '123456789012345678901234567890123', home: 'NameTest', email: 'nametest@mail.com', password: '1234' };
    local.put('/api/users/' + userf.user1._id).send(form).end(function (err,res) {
      expect(err).not.exist;
      expect(error.find(res.body.err, error.NAME_RANGE)).true;
      done();
    });
  });
  it('length 32 name should success', function (done) {
    var form = { name: '12345678901234567890123456789012', home: 'NameTest', email: 'nametest@mail.com', password: '1234' };
    local.put('/api/users/' + userf.user1._id).send(form).end(function (err,res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
});

describe('updating home', function () {
  before(userf.recreate);
  it('given user', function (done) {
    var user = { _id: userb.getNewId(), name: 'Name', namel: 'name', home: 'Home', homel: 'home', email: 'name@mail.com' };
    userb.users.insert(user, function (err) {
      expect(err).not.exist;
      done();
    });
  });
  it('given user1 login', function (done) {
    userf.login('user1', done);
  });
  it('duped with name should fail', function (done) {
    var form = { name: 'Name1', home: 'Name', email: 'name1@mail.com', password: '1234' };
    local.put('/api/users/' + userf.user1._id).send(form).end(function (err,res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      expect(error.find(res.body.err, error.HOME_DUPE)).true;
      done();
    });
  });
  it('duped home should fail', function (done) {
    var form = { name: 'Name2', home: 'HOME', email: 'name2@mail.com', password: '1234' };
    local.put('/api/users/' + userf.user1._id).send(form).end(function (err,res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      expect(error.find(res.body.err, error.HOME_DUPE)).true;
      done();
    });
  });
  it('empty home should fail', function (done) {
    var form = { name: 'Name3', home: '', email: 'name3@mail.com', password: '1234' };
    local.put('/api/users/' + userf.user1._id).send(form).end(function (err,res) {
      expect(err).not.exist;
      expect(error.find(res.body.err, error.HOME_EMPTY)).true;
      done();
    });
  });
  it('short home should fail', function (done) {
    var form = { name: 'Name4', home: 'h', email: 'name4@mail.com', password: '1234' };
    local.put('/api/users/' + userf.user1._id).send(form).end(function (err,res) {
      expect(err).not.exist;
      expect(error.find(res.body.err, error.HOME_RANGE)).true;
      done();
    });
  });
  it('length 2 home should success', function (done) {
    var form = { name: 'Name5', home: 'hh', email: 'name5@mail.com', password: '1234' };
    local.put('/api/users/' + userf.user1._id).send(form).end(function (err,res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it('long home should fail', function (done) {
    var form = { name: 'HomeTest', home: '123456789012345678901234567890123', email: 'hometest@mail.com', password: '1234' };
    local.put('/api/users/' + userf.user1._id).send(form).end(function (err,res) {
      expect(err).not.exist;
      expect(error.find(res.body.err, error.HOME_RANGE)).true;
      done();
    });
  });
  it('length 32 home should success', function (done) {
    var form = { name: 'HomeTest', home: '1234567890123456789012345678901H', email: 'hometest@mail.com', password: '1234' };
    local.put('/api/users/' + userf.user1._id).send(form).end(function (err,res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
});

describe('updating email', function () {
  before(userf.recreate);
  it('given user', function (done) {
    var user = { _id: userb.getNewId(), name: 'Name', namel: 'name', home: 'Home', homel: 'home', email: 'name@mail.com' };
    userb.users.insert(user, function (err) {
      expect(err).not.exist;
      done();
    });
  });
  it('given user1 login', function (done) {
    userf.login('user1', done);
  });
  it('duped email should fail', function (done) {
    var form = { name: 'Name1', home: 'Home1', email: 'name@mail.com', password: '1234' };
    local.put('/api/users/' + userf.user1._id).send(form).end(function (err,res) {
      expect(err).not.exist;
      expect(error.find(res.body.err, error.EMAIL_DUPE)).true;
      done();
    });
  });
  it('invalid email should fail', function (done) {
    var form = { name: 'Name2', home: 'Home2', email: 'abc.mail.com', password: '1234' };
    local.put('/api/users/' + userf.user1._id).send(form).end(function (err,res) {
      expect(err).not.exist;
      expect(error.find(res.body.err, error.EMAIL_PATTERN)).true;
      done();
    });
  });
});

describe('updating password', function () {
  before(userf.recreate);
  it('given user', function (done) {
    var user = { _id: userb.getNewId(), name: 'Name', namel: 'name', home: 'Home', homel: 'home', email: 'name@mail.com' };
    userb.users.insert(user, function (err) {
      expect(err).not.exist;
      done();
    });
  });
  it('given user1 login', function (done) {
    userf.login('user1', done);
  });
  it('empty password should success', function (done) {
    var form = { name: 'Name1', home: 'Home1', email: 'pwtest@mail.com' };
    local.put('/api/users/' + userf.user1._id).send(form).end(function (err,res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it('can be checked', function (done) {
    userb.users.findOne({ _id: userf.user1._id }, function (err, user) {
      expect(err).not.exist;
      expect(user).exist;
      expect(bcrypt.compareSync(userf.user1.password, user.hash)).true;
      done();
    });
  });
  it('short password should fail', function (done) {
    var form = { name: 'Name2', home: 'Home2', email: 'name2@mail.com', password: '123' };
    local.put('/api/users/' + userf.user1._id).send(form).end(function (err,res) {
      expect(err).not.exist;
      expect(error.find(res.body.err, error.PASSWORD_RANGE)).true;
      done();
    });
  });
  it('long password should fail', function (done) {
    var form = { name: 'Name3', home: 'Home3', email: 'name3@mail.com', password: '123456789012345678901234567890123' };
    local.put('/api/users/' + userf.user1._id).send(form).end(function (err,res) {
      expect(err).not.exist;
      expect(error.find(res.body.err, error.PASSWORD_RANGE)).true;
      done();
    });
  });
  it('length 32 password should success', function (done) {
    var form = { name: 'Name4', home: 'Home4', email: 'name4@mail.com', password: '12345678901234567890123456789012' };
    local.put('/api/users/' + userf.user1._id).send(form).end(function (err,res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
});

describe('updating cache', function () {
  before(userf.recreate);
  it('given user1 login', function (done) {
    userf.login('user1', done);
  });
  it('given cache loaded', function (done) {
    var user = userf.user1;
    userb.getCached(user._id, function (err, user) {
      expect(err).not.exist;
      expect(user.name).equal(user.name);
      expect(user.home).equal(user.home);
      expect(user.email).equal(user.email);
      done();
    });
  });
  it('should success', function (done) {
    var form = { name: 'Name1', home: 'Home1', email: 'name1@mail.com' };
    local.put('/api/users/' + userf.user1._id).send(form).end(function (err,res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it('can be checked', function (done) {
    userb.getCached(userf.user1._id, function (err, user) {
      expect(err).not.exist;
      expect(user.name).equal('Name1');
      expect(user.home).equal('Home1');
      expect(user.email).equal('name1@mail.com');
      done();
    });
  });
});

