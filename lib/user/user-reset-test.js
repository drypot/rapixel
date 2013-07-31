var should = require('should');
var bcrypt = require('bcrypt');

var init = require('../lang/init');
var config = require('../config/config')({ path: 'config/test.json' });
var mongo = require('../mongo/mongo')({ dropDatabase: true });
var express = require('../express/express');
var userb = require('../user/user-base');
var userf = require('../user/user-fixture');
var userp = require('../user/user-reset');
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

describe("resets collection", function () {
	it("should exist", function () {
		should.exist(mongo.resets);
	});
});

describe("resetting user", function () {
	var _user;
	var _reset;
	before(function () {
		_user = userf.user1;
	});
	it("should success old password", function (next) {
		mongo.users.findOne({ email: _user.email }, function (err, user) {
			should(!err);
			should(userb.checkPassword(_user.password, user.hash));
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
	it("can be confirmed", function (next) {
		mongo.resets.findOne({ email: _user.email }, function (err, reset) {
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
		var form = { id: _reset._id, token: _reset.token, password: 'new-pass' };
		express.put('/api/resets').send(form).end(function (err, res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
	it("should fail old password", function (next) {
		mongo.users.findOne({ email: _user.email }, function (err, user) {
			should(!err);
			should(!userb.checkPassword(_user.password, user.hash));
			next();
		});
	});
	it("should success new password", function (next) {
		mongo.users.findOne({ email: _user.email }, function (err, user) {
			should(!err);
			should(userb.checkPassword('new-pass', user.hash));
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
		mongo.users.findOne({ email: _user.email }, function (err, user) {
			should(!err);
			should(userb.checkPassword(_user.password, user.hash));
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
	it("can be confirmed", function (next) {
		mongo.resets.findOne({ email: _user.email }, function (err, reset) {
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
		mongo.users.findOne({ email: _user.email }, function (err, user) {
			should(!err);
			should(userb.checkPassword(_user.password, user.hash));
			next();
		});
	});
	it("should fail new password", function (next) {
		mongo.users.findOne({ email: _user.email }, function (err, user) {
			should(!err);
			should(!userb.checkPassword('new-pass', user.hash));
			next();
		});
	});
});