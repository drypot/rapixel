var should = require('should');
var bcrypt = require('bcrypt');

var init = require('../lang/init');
var error = require('../error/error');
var config = require('../config/config')({ path: 'config/rapixel-test.json' });
var mongo = require('../mongo/mongo')({ dropDatabase: true });
var express = require('../express/express');
var userb = require('../user/user-base');
var userc = require('../user/user-create');
var userv = require('../user/user-view');
var useru = require('../user/user-update');
var userf = require('../user/user-fixture');

before(function (next) {
	init.run(next);
});

before(function () {
	express.listen();
});

before(function (next) {
	var users = [
		{ _id: userb.newId(), name: 'Name1', namel: 'name1', home: 'Home1', homel: 'home1', email: 'mail1@mail.com' }
	];
	userb.users.insert(users, next);
});

describe("updating user / permission", function () {
	var _user = { name: 'testauth', email: 'testauth@mail.com', password: '1234' };
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
		var form = { name: 'testauth', home: 'testauth', email: 'testauth@mail.com' };
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
		var form = { name: 'testauth', home: 'testauth', email: 'testauth@mail.com' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, error.NOT_AUTHORIZED));
			next();
		});
	});
	it("given admin login", function (next) {
		userf.loginAdmin(next);
	});
	it("should success updating anybody", function (next) {
		var form = { name: 'testauth', home: 'testauth', email: 'testauth@mail.com' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
	it("should fail for invalid id", function (next) {
		var form = { name: 'testauth3', home: 'testauth3', email: 'testauth3@mail.com' };
		express.put('/api/users/' + 999).send(form).end(function (err,res) {
			should(!res.error);
			should(error.find(res.body.err, error.USER_NOT_FOUND));
			next();
		});
	});
});

describe("updating user / name", function () {
	var _user = { name: 'NameTest', email: 'nametest@mail.com', password: '1234' };
	it("given user", function (next) {
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
		var form = { name: 'NameTest-NEW', home: 'NameTest', email: 'nametest@mail.com', password: '1234' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
	it("can be checked", function (next) {
		userb.users.findOne({ _id: _user._id }, function (err, user) {
			should(!err);
			should(user);
			user.name.should.equal('NameTest-NEW');
			user.namel.should.equal('nametest-new');
			next();
		});
	});
	it("should fail with same name to name", function (next) {
		var form = { name: 'NAME1', home: 'NameTest', email: 'nametest@mail.com', password: '1234' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, error.NAME_DUPE));
			next();
		});
	});
	it("should fail with same name to home", function (next) {
		var form = { name: 'HOME1', home: 'NameTest', email: 'nametest@mail.com', password: '1234' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, error.NAME_DUPE));
			next();
		});
	});
	it("should fail when name empty", function (next) {
		var form = { name: '', home: 'NameTest', email: 'nametest@mail.com', password: '1234' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(error.find(res.body.err, error.NAME_EMPTY));
			next();
		});
	});
	it("should fail when name short", function (next) {
		var form = { name: 'u', home: 'NameTest', email: 'nametest@mail.com', password: '1234' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(error.find(res.body.err, error.NAME_RANGE));
			next();

		});
	});
	it("should success when name length 2", function (next) {
		var form = { name: 'uu', home: 'NameTest', email: 'nametest@mail.com', password: '1234' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
	it("should fail when name long", function (next) {
		var form = { name: '123456789012345678901234567890123', home: 'NameTest', email: 'nametest@mail.com', password: '1234' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(error.find(res.body.err, error.NAME_RANGE));
			next();
		});
	});
	it("should success when name length 32", function (next) {
		var form = { name: '12345678901234567890123456789012', home: 'NameTest', email: 'nametest@mail.com', password: '1234' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
});

describe("updating user / home", function () {
	var _user = { name: 'HomeTest', email: 'hometest@mail.com', password: '1234' };
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
		var form = { name: 'HomeTest', home: 'HomeTest-NEW', email: 'hometest@mail.com', password: '1234' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
	it("can be checked", function (next) {
		userb.users.findOne({ _id: _user._id }, function (err, user) {
			should(!err);
			should(user);
			user.name.should.equal('HomeTest');
			user.home.should.equal('HomeTest-NEW');
			user.homel.should.equal('hometest-new');
			next();
		});
	});
	it("should fail with same home to home", function (next) {
		var form = { name: 'HomeTest', home: 'HOME1', email: 'hometest@mail.com', password: '1234' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, error.HOME_DUPE));
			next();
		});
	});
	it("should fail with same home to name", function (next) {
		var form = { name: 'HomeTest', home: 'NAME1', email: 'hometest@mail.com', password: '1234' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, error.HOME_DUPE));
			next();
		});
	});
	it("should fail when home empty", function (next) {
		var form = { name: 'HomeTest', home: '', email: 'hometest@mail.com', password: '1234' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(error.find(res.body.err, error.HOME_EMPTY));
			next();
		});
	});
	it("should fail when home short", function (next) {
		var form = { name: 'HomeTest', home: 'h', email: 'hometest@mail.com', password: '1234' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(error.find(res.body.err, error.HOME_RANGE));
			next();

		});
	});
	it("should success when home length 2", function (next) {
		var form = { name: 'HomeTest', home: 'hh', email: 'hometest@mail.com', password: '1234' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
	it("should fail when home long", function (next) {
		var form = { name: 'HomeTest', home: '123456789012345678901234567890123', email: 'hometest@mail.com', password: '1234' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(error.find(res.body.err, error.HOME_RANGE));
			next();
		});
	});
	it("should success when home length 32", function (next) {
		var form = { name: 'HomeTest', home: '1234567890123456789012345678901H', email: 'hometest@mail.com', password: '1234' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
});

describe("updating user / email", function () {
	var _user = { name: 'mailtest', email: 'mailtest@mail.com', password: '1234' };
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
		var form = { name: 'mailtest', home: 'mailtest', email: 'mailtest-new@mail.com', password: '1234' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
	it("can be checked", function (next) {
		userb.users.findOne({ _id: _user._id }, function (err, user) {
			should(!err);
			should(user);
			user.email.should.equal('mailtest-new@mail.com');
			next();
		});
	});
	it("should fail when already exists", function (next) {
		var form = { name: 'mailtest', home: 'mailtest', email: 'mail1@mail.com', password: '1234' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(error.find(res.body.err, error.EMAIL_DUPE));
			next();
		});
	});
	it("should fail when email invalid", function (next) {
		var form = { name: 'mailtest', home: 'mailtest', email: 'abc.mail.com', password: '1234' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(error.find(res.body.err, error.EMAIL_PATTERN));
			next();
		});
	});
});

describe("updating user / password", function () {
	var _user = { name: 'pwtest', email: 'pwtest@mail.com', password: '1234' };
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
		var form = { name: 'pwtest', home: 'pwtest', email: 'pwtest@mail.com', password: '5678' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
	it("can be checked", function (next) {
		userb.users.findOne({ _id: _user._id }, function (err, user) {
			should(!err);
			should(user);
			bcrypt.compareSync('5678', user.hash).should.true;
			next();
		});
	});
	it("should success when password emtpy", function (next) {
		var form = { name: 'pwtest', home: 'pwtest', email: 'pwtest@mail.com' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
	it("can be checked", function (next) {
		userb.users.findOne({ _id: _user._id }, function (err, user) {
			should(!err);
			should(user);
			bcrypt.compareSync('5678', user.hash).should.true;
			next();
		});
	});
	it("should fail when password short", function (next) {
		var form = { name: 'pwtest', home: 'pwtest', email: 'pwtest@mail.com', password: '123' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(error.find(res.body.err, error.PASSWORD_RANGE));
			next();
		});
	});
	it("should fail when password long", function (next) {
		var form = { name: 'pwtest', home: 'pwtest', email: 'pwtest@mail.com', password: '123456789012345678901234567890123' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(error.find(res.body.err, error.PASSWORD_RANGE));
			next();
		});
	});
	it("should success when password 32", function (next) {
		var form = { name: 'pwtest', home: 'pwtest', email: 'pwtest@mail.com', password: '12345678901234567890123456789012' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
});

describe("updating user / profile", function () {
	var _user = { name: 'pftest', email: 'pftest@mail.com', password: '1234', profile: 'profile' };
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
		var form = { name: 'pftest', home: 'pftest', email: 'pftest@mail.com', profile: 'profile-new' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
	it("can be checked", function (next) {
		userb.users.findOne({ _id: _user._id }, function (err, user) {
			should(!err);
			should(user);
			user.profile.should.equal('profile-new');
			next();
		});
	});
});

describe("updating user / cache", function () {
	var _user = { name: 'cachetest', email: 'cachetest@mail.com', password: '1234' };
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
		userv.getCached(_user._id, function (err, user) {
			should(!err);
			user.name.should.equal('cachetest');
			user.home.should.equal('cachetest');
			user.email.should.equal('cachetest@mail.com');
			next();
		});
	});
	it("should success", function (next) {
		var form = { name: 'cachetest-new', home: 'home-new', email: 'cachetest-new@mail.com' };
		express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
	it("check cache after update", function (next) {
		userv.getCached(_user._id, function (err, user) {
			should(!err);
			user.name.should.equal('cachetest-new');
			user.home.should.equal('home-new');
			user.email.should.equal('cachetest-new@mail.com');
			next();
		});
	});
});

