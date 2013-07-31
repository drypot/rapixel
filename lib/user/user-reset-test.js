var should = require('should');
var bcrypt = require('bcrypt');

var init = require('../lang/init');
var config = require('../config/config')({ path: 'config/test.json' });
var mongo = require('../mongo/mongo')({ dropDatabase: true });
var express = require('../express/express');
var userb = require('../user/user-base');
var userc = require('../user/user-create');
var userp = require('../user/user-reset');
var error = require('../error/error');
var ecode = require('../error/ecode');

before(function (next) {
	init.run(next);
});

before(function () {
	express.listen();
});

describe("resets collection", function () {
	it("should exist", function () {
		should.exist(mongo.resets);
	});
});

describe("step1, creating reset request", function () {
	var _user = { name: 'test', email: 'test@def.com', password: '1234' };
	it("given new user", function (next) {
		express.post('/api/users').send(_user).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			_user._id = res.body.id;
			next();
		});
	});
	it("should success", function (next) {
		var form = { email: _user.email };
		express.post('/api/resets').send(form).end(function (err, res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
	it("can be confirmed", function (next) {
		mongo.resets.findOne({ email: _user.email }, function (err, reset) {
			should(!err);
			should(reset._id);
			should(reset.token);
			should(reset.email == _user.email);
			next();
		});
	});
	it("should fail with invalid email", function (next) {
		var form = { email: 'abc.def.xyz' };
		express.post('/api/resets').send(form).end(function (err, res) {
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, ecode.EMAIL_PATTERN));
			next();
		});
	});
	it("should fail with non-exist email", function (next) {
		var form = { email: 'non-exist@xyz.com' };
		express.post('/api/resets').send(form).end(function (err, res) {
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, ecode.EMAIL_NOT_EXIST));
			next();
		});
	});
});

describe("step2, resetting", function () {
	var _user = { name: 'test2', email: 'test2@def.com', password: '1234' };
	var _reset;
	it("given empty resets", function (next) {
		mongo.resets.remove(next);
	});
	it("given new user", function (next) {
		express.post('/api/users').send(_user).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			_user._id = res.body.id;
			next();
		});
	});
	it("should success password 1234", function (next) {
		mongo.users.findOne({ email: _user.email }, function (err, user) {
			should(!err);
			should(userb.checkPassword('1234', user.hash));
			next();
		});
	});
	it("given new reset request", function (next) {
		var form = { email: _user.email };
		express.post('/api/resets').send(form).end(function (err, res) {
			should(!res.error);
			should(!res.body.err);
			mongo.resets.findOne({ email: form.email }, function (err, reset) {
				should(!err);
				_reset = reset;
				next();
			});
		});
	});
	it("should fail with invalid id", function (next) {
		var form = { id: '012345678901234567890123', token: _reset.token, password: '4567' };
		express.put('/api/resets').send(form).end(function (err, res) {
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, ecode.INVALID_DATA));
			next();
		});
	});
	it("should fail with invalid token", function (next) {
		var form = { id: _reset._id, token: 'xxxxx', password: '4567' };
		express.put('/api/resets').send(form).end(function (err, res) {
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, ecode.INVALID_DATA));
			next();
		});
	});
	it("should fail with invalid password", function (next) {
		var form = { id: _reset._id, token: _reset.token, password: '' };
		express.put('/api/resets').send(form).end(function (err, res) {
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, ecode.PASSWORD_EMPTY));
			next();
		});
	});
	it("should fail with invalid password", function (next) {
		var form = { id: _reset._id, token: _reset.token, password: 'xx' };
		express.put('/api/resets').send(form).end(function (err, res) {
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, ecode.PASSWORD_RANGE));
			next();
		});
	});
	it("should success", function (next) {
		var form = { id: _reset._id, token: _reset.token, password: '4321' };
		express.put('/api/resets').send(form).end(function (err, res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
	it("should fail password 1234", function (next) {
		mongo.users.findOne({ email: _user.email }, function (err, user) {
			should(!err);
			should(!userb.checkPassword('1234', user.hash));
			next();
		});
	});
	it("should success password 4321", function (next) {
		mongo.users.findOne({ email: _user.email }, function (err, user) {
			should(!err);
			should(userb.checkPassword('4321', user.hash));
			next();
		});
	});
});

describe.only("resetting admin", function () {
	var _user = { name: 'admin2', email: 'admin2@def.com', password: '1234' };
	var _reset;
	it("given empty resets", function (next) {
		mongo.resets.remove(next);
	});
	it("given new admin", function (next) {
		express.post('/api/users').send(_user).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			_user._id = res.body.id;
			mongo.users.update({ _id: _user._id }, { $set: { admin: true } }, next);
		});
	});
	it("should fail password 1234", function (next) {
		mongo.users.findOne({ email: _user.email }, function (err, user) {
			should(!err);
			should(userb.checkPassword('1234', user.hash));
			next();
		});
	});
	it("given new reset request", function (next) {
		var form = { email: _user.email };
		express.post('/api/resets').send(form).end(function (err, res) {
			should(!res.error);
			should(!res.body.err);
			mongo.resets.findOne({ email: form.email }, function (err, reset) {
				should(!err);
				_reset = reset;
				next();
			});
		});
	});
	it("should fail with invalid id", function (next) {
		var form = { id: '012345678901234567890123', token: _reset.token, password: '4567' };
		express.put('/api/resets').send(form).end(function (err, res) {
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, ecode.INVALID_DATA));
			next();
		});
	});
	it("should fail with invalid token", function (next) {
		var form = { id: _reset._id, token: 'xxxxx', password: '4567' };
		express.put('/api/resets').send(form).end(function (err, res) {
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, ecode.INVALID_DATA));
			next();
		});
	});
	it("should fail with invalid password", function (next) {
		var form = { id: _reset._id, token: _reset.token, password: '' };
		express.put('/api/resets').send(form).end(function (err, res) {
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, ecode.PASSWORD_EMPTY));
			next();
		});
	});
	it("should fail with invalid password", function (next) {
		var form = { id: _reset._id, token: _reset.token, password: 'xx' };
		express.put('/api/resets').send(form).end(function (err, res) {
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, ecode.PASSWORD_RANGE));
			next();
		});
	});
	it("should success", function (next) {
		var form = { id: _reset._id, token: _reset.token, password: '4321' };
		express.put('/api/resets').send(form).end(function (err, res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
	it("should success password 1234", function (next) {
		mongo.users.findOne({ email: _user.email }, function (err, user) {
			should(!err);
			should(userb.checkPassword('1234', user.hash));
			next();
		});
	});
	it("should fail password 4321", function (next) {
		mongo.users.findOne({ email: _user.email }, function (err, user) {
			should(!err);
			should(!userb.checkPassword('4321', user.hash));
			next();
		});
	});
});