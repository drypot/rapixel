var should = require('should');
var request = require('superagent').agent();
var bcrypt = require('bcrypt');

var init = require('../main/init');
var config = require('../main/config')({ test: true });
var mongo = require('../main/mongo')({ dropDatabase: true });
var express = require('../main/express');
var error = require('../main/error');
var userl = require('../main/user');
var ufix = require('../test/user-fixture');

require('../main/session-api');
require('../main/user-api');

before(function (next) {
	init.run(next);
});

before(function () {
	express.listen();
});

before(function (next) {
	ufix.createFixtures(next);
});

describe("updating and permission", function () {
	describe("given new user", function () {
		var _user = { name: 'testauth', email: 'testauth@def.com', password: '1234' };
		before(function (next) {
			express.post('/api/users').send(_user).end(function (err,res) {
				should(!res.error);
				should(!res.body.err);
				_user._id = res.body.user._id;
				next();
			});
		});
		before(function (next) {
			var form = { email: _user.email, password: _user.password };
			express.post('/api/sessions').send(form).end(function (err, res) {
				should(!res.error);
				should(!res.body.err);
				next();
			});
		});
		describe("updating own profile", function () {
			it("should success", function (next) {
				var form = { name: 'testauth2', email: 'testauth2@def.com' };
				express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
					should(!res.error);
					should(!res.body.err);
					next();
				});
			});
		});
		describe("updating other's profile", function () {
			before(function (next) {
				ufix.loginUser1(next);
			});
			it("should fail", function (next) {
				var form = { name: 'testauth2', email: 'testauth2@def.com' };
				express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
					should(!res.error);
					res.body.err.rc.should.equal(error.NOT_AUTHORIZED)
					next();
				});
			});
		});
		describe("updating by admin", function () {
			before(function (next) {
				ufix.loginAdmin(next);
			});
			it("should success", function (next) {
				var form = { name: 'testauth2', email: 'testauth2@def.com' };
				express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
					should(!res.error);
					should(!res.body.err);
					next();
				});
			});
			it("should fail for invalid id", function (next) {
				var form = { name: 'testauth3', email: 'testauth3@def.com' };
				express.put('/api/users/' + 999).send(form).end(function (err,res) {
					should(!res.error);
					res.body.err.rc.should.equal(error.USER_NOT_FOUND);
					next();
				});
			});
		});
	});
});

describe("updating and cache", function () {
	describe("given new user", function () {
		var _user = { name: 'testcache', email: 'testcache@def.com', password: '1234' };
		before(function (next) {
			express.post('/api/users').send(_user).end(function (err,res) {
				should(!res.error);
				should(!res.body.err);
				_user._id = res.body.user._id;
				next();
			});
		});
		before(function (next) {
			var form = { email: _user.email, password: _user.password };
			express.post('/api/sessions').send(form).end(function (err, res) {
				should(!res.error);
				should(!res.body.err);
				next();
			});
		});
		describe("checking cache before update", function () {
			it("should success", function (next) {
				userl.findCachedUser(_user._id, function (err, user) {
					should(!err);
					user.name.should.equal('testcache');
					user.email.should.equal('testcache@def.com');
					next();
				});
			});
		});
		describe("checking cache after update", function () {
			before(function (next) {
				var form = { name: 'testcache2', email: 'testcache2@def.com' };
				express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
					should(!res.error);
					should(!res.body.err);
					next();
				});
			});
			it("should success", function (next) {
				userl.findCachedUser(_user._id, function (err, user) {
					should(!err);
					user.name.should.equal('testcache2');
					user.email.should.equal('testcache2@def.com');
					next();
				});
			});
		});
	});
});

describe("updating user name", function () {
	describe("given new user", function () {
		var _user = { name: 'testname', email: 'testname@def.com', password: '1234' };
		before(function (next) {
			express.post('/api/users').send(_user).end(function (err,res) {
				should(!res.error);
				should(!res.body.err);
				_user._id = res.body.user._id;
				next();
			});
		});
		before(function (next) {
			var form = { email: _user.email, password: _user.password };
			express.post('/api/sessions').send(form).end(function (err, res) {
				should(!res.error);
				should(!res.body.err);
				next();
			});
		});
		it("should fail when already exists", function (next) {
			var form = { name: ufix.user1.name, email: 'testname@def.com', password: '1234' };
			express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
				should(!res.error);
				should(error.find(res.body.err, 'name', error.msg.NAME_DUPE));
				next();
			});
		});
		it("should fail when name empty", function (next) {
			var form = { name: '', email: 'testname@def.com', password: '1234' };
			express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
				should(!res.error);
				should(error.find(res.body.err, 'name', error.msg.NAME_EMPTY));
				next();
			});
		});
		it("should fail when name short", function (next) {
			var form = { name: 'u', email: 'testname@def.com', password: '1234' };
			express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
				should(!res.error);
				should(error.find(res.body.err, 'name', error.msg.NAME_RANGE));
				next();

			});
		});
		it("should success when name length 2", function (next) {
			var form = { name: 'uu', email: 'testname@def.com', password: '1234' };
			express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
				should(!res.error);
				should(!res.body.err);
				next();
			});
		});
		it("should fail when name long", function (next) {
			var form = { name: '123456789012345678901234567890123', email: 'testname@def.com', password: '1234' };
			express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
				should(!res.error);
				should(error.find(res.body.err, 'name', error.msg.NAME_RANGE));
				next();
			});
		});
		it("should success when name length 32", function (next) {
			var form = { name: '12345678901234567890123456789012', email: 'testname@def.com', password: '1234' };
			express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
				should(!res.error);
				should(!res.body.err);
				next();
			});
		});
		describe("check by reading", function () {
			it("should success", function (next) {
				mongo.findUser(_user._id, function (err, user) {
					should(!err);
					should(user);
					user.name.should.equal('12345678901234567890123456789012');
					next();
				});
			});
		});
	});
});

describe("updating user email", function () {
	describe("given new user", function () {
		var _user = { name: 'testemail', email: 'testemail@def.com', password: '1234' };
		before(function (next) {
			express.post('/api/users').send(_user).end(function (err,res) {
				should(!err);
				should(!res.error);
				should(!res.body.err);
				_user._id = res.body.user._id;
				next();
			});
		});
		before(function (next) {
			var form = { email: _user.email, password: _user.password };
			express.post('/api/sessions').send(form).end(function (err, res) {
				should(!err);
				should(!res.error);
				should(!res.body.err);
				next();
			});
		});
		it("should fail when already exists", function (next) {
			var form = { name: 'testemail', email: ufix.user1.email, password: '1234' };
			express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
				should(!res.error);
				should(error.find(res.body.err, 'email', error.msg.EMAIL_DUPE));
				next();
			});
		});
		it("should fail when email invalid", function (next) {
			var form = { name: 'testemail', email: 'abc.def.com', password: '1234' };
			express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
				should(!res.error);
				should(error.find(res.body.err, 'email', error.msg.EMAIL_PATTERN));
				next();
			});
		});
		it("should success", function (next) {
			var form = { name: 'testemail', email: 'testemail2@def.com', password: '1234' };
			express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
				should(!res.error);
				should(!res.body.err);
				next();
			});
		});
		describe("check by reading", function () {
			it("should success", function (next) {
				mongo.findUser(_user._id, function (err, user) {
					should(!err);
					should(user);
					user.email.should.equal('testemail2@def.com');
					next();
				});
			});
		});
	});
});

describe("updating user password", function () {
	describe("given new user", function () {
		var _user = { name: 'testpw', email: 'testpw@def.com', password: '1234' };
		before(function (next) {
			express.post('/api/users').send(_user).end(function (err,res) {
				should(!res.error);
				should(!res.body.err);
				_user._id = res.body.user._id;
				next();
			});
		});
		before(function (next) {
			var form = { email: _user.email, password: _user.password };
			express.post('/api/sessions').send(form).end(function (err, res) {
				should(!res.error);
				should(!res.body.err);
				next();
			});
		});
		it("should fail when password short", function (next) {
			var form = { name: 'testpw', email: 'testpw@def.com', password: '123' };
			express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
				should(!res.error);
				should(error.find(res.body.err, 'password', error.msg.PASSWORD_RANGE));
				next();
			});
		});
		it("should fail when password long", function (next) {
			var form = { name: 'testpw', email: 'testpw@def.com', password: '123456789012345678901234567890123' };
			express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
				should(!res.error);
				should(error.find(res.body.err, 'password', error.msg.PASSWORD_RANGE));
				next();
			});
		});
		it("should success when password 32", function (next) {
			var form = { name: 'testpw', email: 'testpw@def.com', password: '12345678901234567890123456789012' };
			express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
				should(!res.error);
				should(!res.body.err);
				next();
			});
		});
		describe("check by reading", function () {
			it("should success", function (next) {
				mongo.findUser(_user._id, function (err, user) {
					should(!err);
					should(user);
					bcrypt.compareSync('12345678901234567890123456789012', user.hash).should.true;
					next();
				});
			});
		});
		it("should success when password emtpy", function (next) {
			var form = { name: 'testpw', email: 'testpw@def.com' };
			express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
				should(!res.error);
				should(!res.body.err);
				next();
			});
		});
		describe("check by reading", function () {
			it("should success", function (next) {
				mongo.findUser(_user._id, function (err, user) {
					should(!err);
					should(user);
					bcrypt.compareSync('12345678901234567890123456789012', user.hash).should.true;
					next();
				});
			});
		});
	});
});

describe("updating user profile", function () {
	describe("given new user", function () {
		var _user = { name: 'testprofile', email: 'testprofile@def.com', password: '1234', profile: 'profile', footer: 'footer' };
		before(function (next) {
			express.post('/api/users').send(_user).end(function (err,res) {
				should(!res.error);
				should(!res.body.err);
				_user._id = res.body.user._id;
				next();
			});
		});
		before(function (next) {
			var form = { email: _user.email, password: _user.password };
			express.post('/api/sessions').send(form).end(function (err, res) {
				should(!res.error);
				should(!res.body.err);
				next();
			});
		});
		it("should success", function (next) {
			var form = { name: 'testprofile', email: 'testprofile@def.com', profile: 'profile2', footer: 'footer2' };
			express.put('/api/users/' + _user._id).send(form).end(function (err,res) {
				should(!res.error);
				should(!res.body.err);
				next();
			});
		});
		describe("check by reading", function () {
			it("should success", function (next) {
				mongo.findUser(_user._id, function (err, user) {
					should(!err);
					should(user);
					user.profile.should.equal('profile2');
					user.footer.should.equal('footer2');
					next();
				});
			});
		});
	});
});