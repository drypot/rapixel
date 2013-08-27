var should = require('should');

var init = require('../lang/init');
var error = require('../error/error');
var config = require('../config/config')({ path: 'config/rapixel-test.json' });
var mongo = require('../mongo/mongo')({ dropDatabase: true });
var express = require('../express/express');
var userb = require('../user/user-base');
var userc = require('../user/user-create');

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
		should(id1 < id2);
	});
});

describe("creating user / name check", function () {
	it("shoud success", function (next) {
		var form = { name: 'NameTest', email: 'nametest@mail.com', password: '1234' };
		express.post('/api/users').send(form).end(function (err,res) {
			should(!res.body.err);
			next();
		});
	});
	it("can be checked", function (next) {
		userb.users.findOne({ email: 'nametest@mail.com' }, function (err, user) {
			should(!err);
			user.name.should.equal('NameTest');
			user.namel.should.equal('nametest');
			user.home.should.equal('NameTest');
			user.homel.should.equal('nametest');
			next();
		});
	});
	it("shoud success with another name", function (next) {
		var form = { name: 'NameTest2', email: 'nametest2@mail.com', password: '1234' };
		express.post('/api/users').send(form).end(function (err,res) {
			should(!res.body.err);
			next();
		});
	});
	it("should fail with same name to name", function (next) {
		var form = { name: 'NAME1', email: 'nametest9837@mail.com', password: '1234' };
		express.post('/api/users').send(form).end(function (err,res) {
			should(res.body.err);
			should(error.find(res.body.err, error.NAME_DUPE));
			next();
		});
	});
	it("should fail with same name to home", function (next) {
		var form = { name: 'HOME1', email: 'nametest4329@mail.com', password: '1234' };
		express.post('/api/users').send(form).end(function (err,res) {
			should(res.body.err);
			should(error.find(res.body.err, error.NAME_DUPE));
			next();
		});
	});
	it("should success when name length 2", function (next) {
		var form = { name: '12', email: 'nametest4783@mail.com', password: '1234' };
		express.post('/api/users').send(form).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			should(res.body.id);
			next();
		});
	});
	it("should success when name length 32", function (next) {
		var form = { name: '12345678901234567890123456789012', email: 'nametest9928@mail.com', password: '1234' };
		express.post('/api/users').send(form).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
	it("should fail when name empty", function (next) {
		var form = { name: '', email: 'nametest2243@mail.com', password: '1234' };
		express.post('/api/users').send(form).end(function (err,res) {
			should(!res.error);
			should(error.find(res.body.err, error.NAME_EMPTY));
			next();
		});
	});
	it("should fail when name short", function (next) {
		var form = { name: 'a', email: 'nametest3492@mail.com', password: '1234' };
		express.post('/api/users').send(form).end(function (err,res) {
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, error.NAME_RANGE));
			next();
		});
	});
	it("should fail when name long", function (next) {
		var form = { name: '123456789012345678901234567890123', email: 'nametest7762@mail.com', password: '1234' };
		express.post('/api/users').send(form).end(function (err,res) {
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, error.NAME_RANGE));
			next();
		});
	});
});

describe("creating user / email check", function () {
	it("should success", function (next) {
		var form = { name: 'mailtest', email: 'mailtest1@mail.com', password: '1234' };
		express.post('/api/users').send(form).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
	it("should fail with same email", function (next) {
		var form = { name: 'mailtest8724', email: 'mail1@mail.com', password: '1234' };
		express.post('/api/users').send(form).end(function (err,res) {
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, error.EMAIL_DUPE));
			next();
		});
	});
	it("should success with different case", function (next) {
		var form = { name: 'mailtest0098', email: 'Mail1@mail.com', password: '1234' };
		express.post('/api/users').send(form).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
	it("should fail when email invalid", function (next) {
		var form = { name: 'mailtest9938', email: 'abc.mail.com', password: '1234' };
		express.post('/api/users').send(form).end(function (err,res) {
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, error.EMAIL_PATTERN));
			next();
		});
	});
	it("should fail when email invalid", function (next) {
		var form = { name: 'mailtest2342', email: 'abc*xyz@mail.com', password: '1234' };
		express.post('/api/users').send(form).end(function (err,res) {
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, error.EMAIL_PATTERN));
			next();
		});
	});
	it("should success with dash", function (next) {
		var form = { name: 'mailtest1124', email: '-a-b-c_d-e-f@mail.com', password: '1234' };
		express.post('/api/users').send(form).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
	it("should success with +", function (next) {
		var form = { name: 'mailtest5836', email: 'abc+xyz@mail.com', password: '1234' };
		express.post('/api/users').send(form).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
});

describe("creating user / password check", function () {
	it("should success", function (next) {
		var form = { name: 'passtest3847', email: 'passtest3847@mail.com', password: '1234' };
		express.post('/api/users').send(form).end(function (err,res) {
			should(!res.body.err);
			next();
		});
	});
	it("can be checked", function (next) {
		userb.users.findOne({ email: 'passtest3847@mail.com' }, function (err, user) {
			should(!err);
			user.name.should.equal('passtest3847');
			userc.checkPassword('1234', user.hash).should.true;
			userc.checkPassword('4444', user.hash).should.false;
			next();
		});
	});
	it("should fail when password short", function (next) {
		var form = { name: 'passtet8792', email: 'passtet8792@mail.com', password: '123' };
		express.post('/api/users').send(form).end(function (err,res) {
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, error.PASSWORD_RANGE));
			next();
		});
	});
	it("should fail when password long", function (next) {
		var form = { name: 'passtest9909', email: 'passtest9909@mail.com', password: '123456789012345678901234567890123' };
		express.post('/api/users').send(form).end(function (err,res) {
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, error.PASSWORD_RANGE));
			next();
		});
	});
	it("should success when password 32", function (next) {
		var form = { name: 'passtest3344', email: 'passtest3344@mail.com', password: '12345678901234567890123456789012' };
		express.post('/api/users').send(form).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
});

