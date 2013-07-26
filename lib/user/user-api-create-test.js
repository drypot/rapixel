var should = require('should');
var request = require('superagent').agent();

var init = require('../lang/init');
var config = require('../config/config')({ test: true });
var mongo = require('../mongo/mongo')({ dropDatabase: true });
var express = require('../express/express');
var userl = require('../user/user');
var error = require('../error/error');
var ecode = require('../error/ecode');

require('../user/user-api');

before(function (next) {
	init.run(next);
});

before(function () {
	express.listen();
});

describe("creating user / name check", function () {
	before(function (next) {
		mongo.users.remove(next);
	});
	it("shoud success", function (next) {
		var form = { name: 'snowman', email: 'snowman@def.com', password: '1234' };
		express.post('/api/users').send(form).end(function (err,res) {
			should(!res.body.err);
			next();
		});
	});
	it("check by reading", function (next) {
		mongo.findUserByEmail('snowman@def.com', function (err, user) {
			should(!err);
			user.name.should.equal('snowman');
			next();
		});
	});
	it("shoud success", function (next) {
		var form = { name: 'snowboy', email: 'snowboy@def.com', password: '1234' };
		express.post('/api/users').send(form).end(function (err,res) {
			should(!res.body.err);
			next();
		});
	});
	it("check by reading", function (next) {
		mongo.findUserByName('snowboy', function (err, user) {
			should(!err);
			user.name.should.equal('snowboy');
			next();
		});
	});
	it("should fail with same name", function (next) {
		var form = { name: 'snowman', email: 'snowman-xyz@def.com', password: '1234' };
		express.post('/api/users').send(form).end(function (err,res) {
			should(res.body.err);
			should(error.find(res.body.err, ecode.NAME_DUPE));
			should(error.find(res.body.err, ecode.HOME_DUPE));
			next();
		});
	});
	it("should success when name length 2", function (next) {
		var form = { name: '12', email: 'test2@def.com', password: '1234' };
		express.post('/api/users').send(form).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			should(res.body.user);
			should(res.body.user._id);
			next();
		});
	});
	it("should success when name length 32", function (next) {
		var form = { name: '12345678901234567890123456789012', email: 'test32@def.com', password: '1234' };
		express.post('/api/users').send(form).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
	it("should fail when name empty", function (next) {
		var form = { name: '', email: 'abc@def.com', password: '1234' };
		express.post('/api/users').send(form).end(function (err,res) {
			should(!res.error);
			should(error.find(res.body.err, ecode.NAME_EMPTY));
			next();
		});
	});
	it("should fail when name short", function (next) {
		var form = { name: 'a', email: 'abc@def.com', password: '1234' };
		express.post('/api/users').send(form).end(function (err,res) {
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, ecode.NAME_RANGE));
			next();
		});
	});
	it("should fail when name long", function (next) {
		var form = { name: '123456789012345678901234567890123', email: 'abc@def.com', password: '1234' };
		express.post('/api/users').send(form).end(function (err,res) {
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, ecode.NAME_RANGE));
			next();
		});
	});
});

describe("creating user / email check", function () {
	before(function (next) {
		mongo.users.remove(next);
	});
	it("should success", function (next) {
		var form = { name: 'snowman', email: 'snowman@def.com', password: '1234' };
		express.post('/api/users').send(form).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
	it("should fail with same email", function (next) {
		var form = { name: 'snowboy', email: 'snowman@def.com', password: '1234' };
		express.post('/api/users').send(form).end(function (err,res) {
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, ecode.EMAIL_DUPE));
			next();
		});
	});
	it("should fail when email invalid", function (next) {
		var form = { name: 'abcd', email: 'abc.def.com', password: '1234' };
		express.post('/api/users').send(form).end(function (err,res) {
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, ecode.EMAIL_PATTERN));
			next();
		});
	});
	it("should fail when email invalid", function (next) {
		var form = { name: 'abcd', email: 'abc*xyz@def.com', password: '1234' };
		express.post('/api/users').send(form).end(function (err,res) {
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, ecode.EMAIL_PATTERN));
			next();
		});
	});
	it("should success with dash", function (next) {
		var form = { name: 'abcd', email: '-a-b-c_d-e-f@def.com', password: '1234' };
		express.post('/api/users').send(form).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
	it("should success with +", function (next) {
		var form = { name: 'gmail-name', email: 'abc+xyz@def.com', password: '1234' };
		express.post('/api/users').send(form).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
});

describe("creating user / password check", function () {
	before(function (next) {
		mongo.users.remove(next);
	});
	it("should success", function (next) {
		var form = { name: 'snowman', email: 'snowman@def.com', password: '1234' };
		express.post('/api/users').send(form).end(function (err,res) {
			should(!res.body.err);
			next();
		});
	});
	it("check password by reading", function (next) {
		mongo.findUserByEmail('snowman@def.com', function (err, user) {
			should(!err);
			user.name.should.equal('snowman');
			userl.validatePassword('1234', user.hash).should.true;
			userl.validatePassword('4444', user.hash).should.false;
			next();
		});
	});
	it("should fail when password short", function (next) {
		var form = { name: 'abcd', email: 'abc@def.com', password: '123' };
		express.post('/api/users').send(form).end(function (err,res) {
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, ecode.PASSWORD_RANGE));
			next();
		});
	});
	it("should fail when password long", function (next) {
		var form = { name: 'abcd', email: 'abc@def.com', password: '123456789012345678901234567890123' };
		express.post('/api/users').send(form).end(function (err,res) {
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, ecode.PASSWORD_RANGE));
			next();
		});
	});
	it("should success when password 32", function (next) {
		var form = { name: 'abcd', email: 'abc@def.com', password: '12345678901234567890123456789012' };
		express.post('/api/users').send(form).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
});
