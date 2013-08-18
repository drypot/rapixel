var should = require('should');
var request = require('superagent').agent();

var init = require('../lang/init');
var config = require('../config/config')({ path: 'config/test-rapixel.json' });
var mongo = require('../mongo/mongo')({ dropDatabase: true });
var express = require('../express/express');
var userc = require('../user/user-create');
var error = require('../error/error');

before(function (next) {
	init.run(next);
});

before(function () {
	express.listen();
});

describe("users collection", function () {
	it("should exist", function () {
		should(mongo.users);
		should(mongo.users.find);
	});
});

describe("emailx", function () {
	it("should success", function () {
		userc.emailx.test("abc.def.com").should.false;
		userc.emailx.test("abc*xyz@def.com").should.false;
		userc.emailx.test("-a-b-c_d-e-f@def.com").should.true;
		userc.emailx.test("develop.bj@def.com").should.true;
	});
});

describe("getNewUserId", function () {
	it("should success", function () {
		var id1 = userc.getNewUserId();
		var id1 = userc.getNewUserId();
		var id2 = userc.getNewUserId();
		var id2 = userc.getNewUserId();
		should(id1 < id2);
	});
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
		mongo.users.findOne({ email: 'snowman@def.com' }, function (err, user) {
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
		mongo.users.findOne({ name: 'snowboy' }, function (err, user) {
			should(!err);
			user.name.should.equal('snowboy');
			next();
		});
	});
	it("should fail with same name", function (next) {
		var form = { name: 'snowman', email: 'snowman-xyz@def.com', password: '1234' };
		express.post('/api/users').send(form).end(function (err,res) {
			should(res.body.err);
			should(error.find(res.body.err, error.ids.NAME_DUPE));
			should(error.find(res.body.err, error.ids.HOME_DUPE));
			next();
		});
	});
	it("should success when name length 2", function (next) {
		var form = { name: '12', email: 'test2@def.com', password: '1234' };
		express.post('/api/users').send(form).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			should(res.body.id);
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
			should(error.find(res.body.err, error.ids.NAME_EMPTY));
			next();
		});
	});
	it("should fail when name short", function (next) {
		var form = { name: 'a', email: 'abc@def.com', password: '1234' };
		express.post('/api/users').send(form).end(function (err,res) {
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, error.ids.NAME_RANGE));
			next();
		});
	});
	it("should fail when name long", function (next) {
		var form = { name: '123456789012345678901234567890123', email: 'abc@def.com', password: '1234' };
		express.post('/api/users').send(form).end(function (err,res) {
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, error.ids.NAME_RANGE));
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
			should(error.find(res.body.err, error.ids.EMAIL_DUPE));
			next();
		});
	});
	it("should fail when email invalid", function (next) {
		var form = { name: 'abcd', email: 'abc.def.com', password: '1234' };
		express.post('/api/users').send(form).end(function (err,res) {
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, error.ids.EMAIL_PATTERN));
			next();
		});
	});
	it("should fail when email invalid", function (next) {
		var form = { name: 'abcd', email: 'abc*xyz@def.com', password: '1234' };
		express.post('/api/users').send(form).end(function (err,res) {
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, error.ids.EMAIL_PATTERN));
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
		mongo.users.findOne({ email: 'snowman@def.com' }, function (err, user) {
			should(!err);
			user.name.should.equal('snowman');
			userc.checkPassword('1234', user.hash).should.true;
			userc.checkPassword('4444', user.hash).should.false;
			next();
		});
	});
	it("should fail when password short", function (next) {
		var form = { name: 'abcd', email: 'abc@def.com', password: '123' };
		express.post('/api/users').send(form).end(function (err,res) {
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, error.ids.PASSWORD_RANGE));
			next();
		});
	});
	it("should fail when password long", function (next) {
		var form = { name: 'abcd', email: 'abc@def.com', password: '123456789012345678901234567890123' };
		express.post('/api/users').send(form).end(function (err,res) {
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, error.ids.PASSWORD_RANGE));
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

describe("creating user / dupe check", function () {
	before(function (next) {
		mongo.users.remove(next);
	});
	it("given snowman", function (next) {
		var form = { name: 'snowman', email: 'snowman@def.com', password: '1234' };
		express.post('/api/users').send(form).end(function (err,res) {
			should(!res.body.err);
			next();
		});		
	});
	it("should success creating snowman2", function (next) {
		var form = { name: 'snowman2', email: 'snowman2@def.com', password: '1234' };
		express.post('/api/users').send(form).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
	it("should success creating SnowMan@def.com", function (next) {
		var form = { name: 'snowman3', email: 'SnowMan2@def.com', password: '1234' };
		express.post('/api/users').send(form).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
	it("should fail creating snowman@def.com", function (next) {
		var form = { name: 'snowman3', email: 'snowman@def.com', password: '1234' };
		express.post('/api/users').send(form).end(function (err,res) {
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, error.ids.EMAIL_DUPE));
			next();
		});
	});
	it("should fail creating snowman", function (next) {
		var form = { name: 'snowman', email: 'snowman3@def.com', password: '1234' };
		express.post('/api/users').send(form).end(function (err,res) {
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, error.ids.NAME_DUPE));
			next();
		});
	});
	it("should fail creating SnowMan", function (next) {
		var form = { name: 'SnowMan', email: 'snowman4@def.com', password: '1234' };
		express.post('/api/users').send(form).end(function (err,res) {
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, error.ids.NAME_DUPE));
			next();
		});
	});
});
