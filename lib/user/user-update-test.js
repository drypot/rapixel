var should = require('should');
var bcrypt = require('bcrypt');

var init = require('../lang/init');
var config = require('../config/config')({ path: 'config/test.json' });
var mongo = require('../mongo/mongo')({ dropDatabase: true });
var express = require('../express/express');
var userb = require('../user/user-base');
var userc = require('../user/user-create');
var useru = require('../user/user-update');
var userf = require('../user/user-fixture');
var error = require('../error/error');
var ecode = require('../error/ecode');

before(function (next) {
	init.run(next);
});

before(function () {
	express.listen();
});

before(function (next) {
	userf.create(next);
});

describe("updating user / permission", function () {
	var _user = { name: 'testauth', email: 'testauth@def.com', password: '1234' };
	it("given new user", function (next) {
		express.post('/api/users').send(_user).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			_user._id = res.body.id;
			next();
		});
	});
	it("given new user login", function (next) {
		var form = { email: _user.email, password: _user.password };
		express.post('/api/sessions').send(form).end(function (err, res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
	it("should success updating own profile", function (next) {
		var form = { name: 'testauth2', home: 'testauth', email: 'testauth2@def.com' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
	it("given user1 login", function (next) {
		userf.loginUser1(next);
	});
	it("should fail updating new user's profile", function (next) {
		var form = { name: 'testauth2', home: 'testauth', email: 'testauth2@def.com' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, ecode.NOT_AUTHORIZED));
			next();
		});
	});
	it("given admin login", function (next) {
		userf.loginAdmin(next);
	});
	it("should success updating anybody", function (next) {
		var form = { name: 'testauth2', home: 'testauth', email: 'testauth2@def.com' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
	it("should fail for invalid id", function (next) {
		var form = { name: 'testauth3', home: 'testauth3', email: 'testauth3@def.com' };
		express.put('/api/users/' + 999).send(form).end(function (err,res) {
			should(!res.error);
			should(error.find(res.body.err, ecode.USER_NOT_FOUND));
			next();
		});
	});
});

describe("updating user / name", function () {
	var _user = { name: 'testname', email: 'testname@def.com', password: '1234' };
	var _user2 = { name: 'testname2', email: 'testname2@def.com', password: '1234' };
	it("given new user", function (next) {
		express.post('/api/users').send(_user).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			_user._id = res.body.id;
			next();
		});
	});
	it("given another user", function (next) {
		express.post('/api/users').send(_user2).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			_user2._id = res.body.id;
			next();
		});
	});
	it("given login", function (next) {
		var form = { email: _user.email, password: _user.password };
		express.post('/api/sessions').send(form).end(function (err, res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
	it("should success", function (next) {
		var form = { name: 'testname-new', home: 'testname', email: 'testname@def.com', password: '1234' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
	it("check by reading", function (next) {
		mongo.users.findOne({ _id: _user._id }, function (err, user) {
			should(!err);
			should(user);
			user.name.should.equal('testname-new');
			next();
		});
	});
	it("should fail when already exists", function (next) {
		var form = { name: 'testname2', home: 'testname', email: 'testname@def.com', password: '1234' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(error.find(res.body.err, ecode.NAME_DUPE));
			next();
		});
	});
	it("should fail when already exists", function (next) {
		var form = { name: 'TestName2', home: 'testname', email: 'testname@def.com', password: '1234' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(error.find(res.body.err, ecode.NAME_DUPE));
			next();
		});
	});
	it("should fail when name empty", function (next) {
		var form = { name: '', home: 'testname', email: 'testname@def.com', password: '1234' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(error.find(res.body.err, ecode.NAME_EMPTY));
			next();
		});
	});
	it("should fail when name short", function (next) {
		var form = { name: 'u', home: 'testname', email: 'testname@def.com', password: '1234' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(error.find(res.body.err, ecode.NAME_RANGE));
			next();

		});
	});
	it("should success when name length 2", function (next) {
		var form = { name: 'uu', home: 'testname', email: 'testname@def.com', password: '1234' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
	it("should fail when name long", function (next) {
		var form = { name: '123456789012345678901234567890123', home: 'testname', email: 'testname@def.com', password: '1234' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(error.find(res.body.err, ecode.NAME_RANGE));
			next();
		});
	});
	it("should success when name length 32", function (next) {
		var form = { name: '12345678901234567890123456789012', home: 'testname', email: 'testname@def.com', password: '1234' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
});

describe("updating user / home", function () {
	var _user = { name: 'testhome', email: 'testhome@def.com', password: '1234' };
	var _user2 = { name: 'testhome2', email: 'testhome2@def.com', password: '5678' };
	it("given new user", function (next) {
		express.post('/api/users').send(_user).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			_user._id = res.body.id;
			next();
		});
	});
	it("given another user", function (next) {
		express.post('/api/users').send(_user2).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			_user2._id = res.body.id;
			next();
		});
	});
	it("given another user login", function (next) {
		var form = { email: _user2.email, password: _user2.password };
		express.post('/api/sessions').send(form).end(function (err, res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
	it("given another user name changed", function (next) {
		var form = { name: 'testhome2-new', home: 'testhome2', email: 'testhome2@def.com', password: '5678' };
		express.put('/api/users/' + _user2._id).send(form).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
	it("check by reading", function (next) {
		mongo.users.findOne({ _id: _user2._id }, function (err, user) {
			should(!err);
			should(user);
			user.name.should.equal('testhome2-new');
			user.home.should.equal('testhome2');
			next();
		});
	});
	it("given login", function (next) {
		var form = { email: _user.email, password: _user.password };
		express.post('/api/sessions').send(form).end(function (err, res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
	it("should success", function (next) {
		var form = { name: 'testhome', home: 'testhome-new', email: 'testhome@def.com', password: '1234' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
	it("check by reading", function (next) {
		mongo.users.findOne({ _id: _user._id }, function (err, user) {
			should(!err);
			should(user);
			user.home.should.equal('testhome-new');
			next();
		});
	});
	it("should fail when new home already exists in home", function (next) {
		var form = { name: 'testhome', home: 'testhome2', email: 'testhome@def.com', password: '1234' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(error.find(res.body.err, ecode.HOME_DUPE));
			next();
		});
	});
	it("should fail when new home already exists in name", function (next) {
		var form = { name: 'testhome', home: 'testhome2-new', email: 'testhome@def.com', password: '1234' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(error.find(res.body.err, ecode.HOME_DUPE));
			next();
		});
	});
	it("should fail when home empty", function (next) {
		var form = { name: 'testhome', home: '', email: 'testhome@def.com', password: '1234' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(error.find(res.body.err, ecode.HOME_EMPTY));
			next();
		});
	});
	it("should fail when home short", function (next) {
		var form = { name: 'testhome', home: 'h', email: 'testhome@def.com', password: '1234' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(error.find(res.body.err, ecode.HOME_RANGE));
			next();

		});
	});
	it("should success when home length 2", function (next) {
		var form = { name: 'testhome', home: 'hh', email: 'testhome@def.com', password: '1234' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
	it("should fail when home long", function (next) {
		var form = { name: 'testhome', home: '123456789012345678901234567890123', email: 'testhome@def.com', password: '1234' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(error.find(res.body.err, ecode.HOME_RANGE));
			next();
		});
	});
	it("should success when home length 32", function (next) {
		var form = { name: 'testhome', home: '1234567890123456789012345678901H', email: 'testhome@def.com', password: '1234' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
});

describe("updating user / email", function () {
	var _user = { name: 'testemail', email: 'testemail@def.com', password: '1234' };
	it("given new user", function (next) {
		express.post('/api/users').send(_user).end(function (err,res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			_user._id = res.body.id;
			next();
		});
	});
	it("given login", function (next) {
		var form = { email: _user.email, password: _user.password };
		express.post('/api/sessions').send(form).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
	it("should success", function (next) {
		var form = { name: 'testemail', home: 'testmail', email: 'testemail2@def.com', password: '1234' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
	it("check by reading", function (next) {
		mongo.users.findOne({ _id: _user._id }, function (err, user) {
			should(!err);
			should(user);
			user.email.should.equal('testemail2@def.com');
			next();
		});
	});
	it("should fail when already exists", function (next) {
		var form = { name: 'testemail', home: 'testmail', email: userf.user1.email, password: '1234' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(error.find(res.body.err, ecode.EMAIL_DUPE));
			next();
		});
	});
	it("should fail when email invalid", function (next) {
		var form = { name: 'testemail', home: 'testmail', email: 'abc.def.com', password: '1234' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(error.find(res.body.err, ecode.EMAIL_PATTERN));
			next();
		});
	});
});

describe("updating user / password", function () {
	var _user = { name: 'testpw', email: 'testpw@def.com', password: '1234' };
	it("given new user", function (next) {
		express.post('/api/users').send(_user).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			_user._id = res.body.id;
			next();
		});
	});
	it("given login", function (next) {
		var form = { email: _user.email, password: _user.password };
		express.post('/api/sessions').send(form).end(function (err, res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
	it("should success", function (next) {
		var form = { name: 'testpw', home: 'testpw', email: 'testpw@def.com', password: '5678' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
	it("check by reading", function (next) {
		mongo.users.findOne({ _id: _user._id }, function (err, user) {
			should(!err);
			should(user);
			bcrypt.compareSync('5678', user.hash).should.true;
			next();
		});
	});
	it("should success when password emtpy", function (next) {
		var form = { name: 'testpw', home: 'testpw', email: 'testpw@def.com' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
	it("check by reading", function (next) {
		mongo.users.findOne({ _id: _user._id }, function (err, user) {
			should(!err);
			should(user);
			bcrypt.compareSync('5678', user.hash).should.true;
			next();
		});
	});
	it("should fail when password short", function (next) {
		var form = { name: 'testpw', home: 'testpw', email: 'testpw@def.com', password: '123' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(error.find(res.body.err, ecode.PASSWORD_RANGE));
			next();
		});
	});
	it("should fail when password long", function (next) {
		var form = { name: 'testpw', home: 'testpw', email: 'testpw@def.com', password: '123456789012345678901234567890123' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(error.find(res.body.err, ecode.PASSWORD_RANGE));
			next();
		});
	});
	it("should success when password 32", function (next) {
		var form = { name: 'testpw', home: 'testpw', email: 'testpw@def.com', password: '12345678901234567890123456789012' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
});

describe("updating user / profile", function () {
	var _user = { name: 'testprofile', email: 'testprofile@def.com', password: '1234', profile: 'profile' };
	it("given new user", function (next) {
		express.post('/api/users').send(_user).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			_user._id = res.body.id;
			next();
		});
	});
	it("given login", function (next) {
		var form = { email: _user.email, password: _user.password };
		express.post('/api/sessions').send(form).end(function (err, res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
	it("should success", function (next) {
		var form = { name: 'testprofile', home: 'testprofile', email: 'testprofile@def.com', profile: 'profile2' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
	it("check by reading", function (next) {
		mongo.users.findOne({ _id: _user._id }, function (err, user) {
			should(!err);
			should(user);
			user.profile.should.equal('profile2');
			next();
		});
	});
});

describe("updating user / cache", function () {
	var _user = { name: 'testcache', email: 'testcache@def.com', password: '1234' };
	it("given new user", function (next) {
		express.post('/api/users').send(_user).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			_user._id = res.body.id;
			next();
		});
	});
	it("given login", function (next) {
		var form = { email: _user.email, password: _user.password };
		express.post('/api/sessions').send(form).end(function (err, res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
	it("check cache before update", function (next) {
		userb.getCached(_user._id, function (err, user) {
			should(!err);
			user.name.should.equal('testcache');
			user.home.should.equal('testcache');
			user.email.should.equal('testcache@def.com');
			next();
		});
	});
	it("should success", function (next) {
		var form = { name: 'testcache2', home: 'home2', email: 'testcache2@def.com' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
	it("check cache after update", function (next) {
		userb.getCached(_user._id, function (err, user) {
			should(!err);
			user.name.should.equal('testcache2');
			user.home.should.equal('home2');
			user.email.should.equal('testcache2@def.com');
			next();
		});
	});
});

