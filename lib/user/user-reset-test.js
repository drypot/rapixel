var should = require('should');
var bcrypt = require('bcrypt');

var init = require('../lang/init');
var error = require('../error/error');
var config = require('../config/config')({ path: 'config/rapixel-test.json' });
var mongo = require('../mongo/mongo')({ dropDatabase: true });
var express = require('../express/express');
var userb = require('../user/user-base');
var userc = require('../user/user-create');
var userf = require('../user/user-fixture');
var userp = require('../user/user-reset');

before(function (next) {
	init.run(next);
});

before(function () {
	express.listen();
});

describe("resets collection", function () {
	it("should exist", function () {
		should.exist(userb.resets);
	});
});

describe("resetting user", function () {
	var _user;
	var _reset;
	before(function () {
		_user = userf.user1;
	});
	it("should success old password", function (next) {
		userb.users.findOne({ email: _user.email }, function (err, user) {
			should(!err);
			should(userc.checkPassword(_user.password, user.hash));
			next();
		});
	});
	it("given new reset request", function (next) {
		var form = { email: _user.email };
		express.post('/api/resets').send(form).end(function (err, res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
	it("can be checked", function (next) {
		userb.resets.findOne({ email: _user.email }, function (err, reset) {
			should(!err);
			should(reset._id);
			should(reset.token);
			should(reset.email == _user.email);
			_reset = reset;
			next();
		});
	});
	it("should fail with invalid email", function (next) {
		var form = { email: 'abc.def.xyz' };
		express.post('/api/resets').send(form).end(function (err, res) {
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, error.EMAIL_PATTERN));
			next();
		});
	});
	it("should fail with non-exist email", function (next) {
		var form = { email: 'non-exist@xyz.com' };
		express.post('/api/resets').send(form).end(function (err, res) {
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, error.EMAIL_NOT_EXIST));
			next();
		});
	});
	it("should fail with invalid id", function (next) {
		var form = { id: '012345678901234567890123', token: _reset.token, password: '4567' };
		express.put('/api/resets').send(form).end(function (err, res) {
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, error.INVALID_DATA));
			next();
		});
	});
	it("should fail with invalid token", function (next) {
		var form = { id: _reset._id, token: 'xxxxx', password: '4567' };
		express.put('/api/resets').send(form).end(function (err, res) {
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, error.INVALID_DATA));
			next();
		});
	});
	it("should fail with invalid password", function (next) {
		var form = { id: _reset._id, token: _reset.token, password: '' };
		express.put('/api/resets').send(form).end(function (err, res) {
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, error.PASSWORD_EMPTY));
			next();
		});
	});
	it("should fail with invalid password", function (next) {
		var form = { id: _reset._id, token: _reset.token, password: 'xx' };
		express.put('/api/resets').send(form).end(function (err, res) {
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, error.PASSWORD_RANGE));
			next();
		});
	});
	it("should success", function (next) {
		var form = { id: _reset._id, token: _reset.token, password: 'new-pass' };
		express.put('/api/resets').send(form).end(function (err, res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
	it("should fail old password", function (next) {
		userb.users.findOne({ email: _user.email }, function (err, user) {
			should(!err);
			should(!userc.checkPassword(_user.password, user.hash));
			next();
		});
	});
	it("should success new password", function (next) {
		userb.users.findOne({ email: _user.email }, function (err, user) {
			should(!err);
			should(userc.checkPassword('new-pass', user.hash));
			next();
		});
	});
});

describe("resetting admin", function () {
	var _user;
	var _reset;
	before(function () {
		_user = userf.admin;
	});
	it("should success old password", function (next) {
		userb.users.findOne({ email: _user.email }, function (err, user) {
			should(!err);
			should(userc.checkPassword(_user.password, user.hash));
			next();
		});
	});
	it("given new reset request", function (next) {
		var form = { email: _user.email };
		express.post('/api/resets').send(form).end(function (err, res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
	it("can be checked", function (next) {
		userb.resets.findOne({ email: _user.email }, function (err, reset) {
			should(!err);
			should(reset._id);
			should(reset.token);
			should(reset.email == _user.email);
			_reset = reset;
			next();
		});
	});
	it("should success", function (next) {
		var form = { id: _reset._id, token: _reset.token, password: 'new-pass' };
		express.put('/api/resets').send(form).end(function (err, res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
	it("should success old password (password not changed)", function (next) {
		userb.users.findOne({ email: _user.email }, function (err, user) {
			should(!err);
			should(userc.checkPassword(_user.password, user.hash));
			next();
		});
	});
	it("should fail new password", function (next) {
		userb.users.findOne({ email: _user.email }, function (err, user) {
			should(!err);
			should(!userc.checkPassword('new-pass', user.hash));
			next();
		});
	});
});