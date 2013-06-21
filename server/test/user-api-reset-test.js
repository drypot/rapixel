var should = require('should');
var request = require('superagent').agent();
var bcrypt = require('bcrypt');

var init = require('../main/init');
var config = require('../main/config')({ test: true });
var mongo = require('../main/mongo')({ dropDatabase: true });
var express = require('../main/express');
var userl = require('../main/user');
var error = require('../main/error');
var ecode = require('../main/ecode');

require('../main/user-api');

before(function (next) {
	init.run(next);
});

before(function () {
	express.listen();
});

describe("creating reset request", function () {

	var _user = { name: 'test', email: 'test@def.com', password: '1234' };

	before(function (next) {
		express.post('/api/users').send(_user).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			_user._id = res.body.user._id;
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
});

describe("resetting", function () {

	var _user = { name: 'test2', email: 'test2@def.com', password: '1234' };

	before(function (next) {
		mongo.resets.remove(next);
	});
	before(function (next) {
		express.post('/api/users').send(_user).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			_user._id = res.body.user._id;
			next();
		});
	});
	describe("validating password 1234", function () {
		it("should success", function (next) {
			mongo.findUserByEmail(_user.email, function (err, user) {
				should(!err);
				should(userl.validatePassword(_user.password, user.hash));
				next();
			});
		});
	});
	describe("given new reset request", function () {
		var _reset;
		before(function (next) {
			var form = { email: _user.email };
			express.post('/api/resets').send(form).end(function (err, res) {
				should(!res.error);
				should(!res.body.err);
				next();
			});
		});
		before(function (next) {
			mongo.resets.findOne({ email: _user.email }, function (err, reset) {
				should(!err);
				_reset = reset;
				next();
			});
		});
		it("should fail with invalid id", function (next) {
			var form = { _id: '012345678901234567890123', token: _reset.token, password: '4567' };
			express.put('/api/resets').send(form).end(function (err, res) {
				should(!res.error);
				should(res.body.err);
				should(error.find(res.body.err, ecode.INVALID_DATA));
				next();
			});
		});
		it("should fail with invalid token", function (next) {
			var form = { _id: _reset._id, token: 'xxxxx', password: '4567' };
			express.put('/api/resets').send(form).end(function (err, res) {
				should(!res.error);
				should(res.body.err);
				should(error.find(res.body.err, ecode.INVALID_DATA));
				next();
			});
		});
		it("should fail with invalid password", function (next) {
			var form = { _id: _reset._id, token: _reset.token, password: '' };
			express.put('/api/resets').send(form).end(function (err, res) {
				should(!res.error);
				should(res.body.err);
				should(error.find(res.body.err, ecode.PASSWORD_EMPTY));
				next();
			});
		});
		it("should fail with invalid password", function (next) {
			var form = { _id: _reset._id, token: _reset.token, password: 'xx' };
			express.put('/api/resets').send(form).end(function (err, res) {
				should(!res.error);
				should(res.body.err);
				should(error.find(res.body.err, ecode.PASSWORD_RANGE));
				next();
			});
		});
		it("should success", function (next) {
			var form = { _id: _reset._id, token: _reset.token, password: '4321' };
			express.put('/api/resets').send(form).end(function (err, res) {
				should(!res.error);
				should(!res.body.err);
				next();
			});
		});
	});
	describe("validating password 1234", function () {
		it("should fail because password changed", function (next) {
			mongo.findUserByEmail(_user.email, function (err, user) {
				should(!err);
				should(!userl.validatePassword(_user.password, user.hash));
				next();
			});
		});
	});
	describe("validating password 4321", function () {
		it("should success", function (next) {
			mongo.findUserByEmail(_user.email, function (err, user) {
				should(!err);
				should(userl.validatePassword('4321', user.hash));
				next();
			});
		});
	});
});

describe("resetting admin", function () {

	var _user = { name: 'admin2', email: 'admin2@def.com', password: '1234' };

	before(function (next) {
		mongo.resets.remove(next);
	});
	before(function (next) {
		express.post('/api/users').send(_user).end(function (err,res) {
			should(!res.error);
			should(!res.body.err);
			_user._id = res.body.user._id;
			next();
		});
	});
	before(function (next) {
		mongo.users.update({ email: _user.email }, { $set: { admin: true } }, next);
	});
	describe("validating password 1234", function () {
		it("should success", function (next) {
			mongo.findUserByEmail(_user.email, function (err, user) {
				should(!err);
				should(userl.validatePassword(_user.password, user.hash));
				next();
			});
		});
	});
	describe("given new reset request", function () {
		var _reset;
		before(function (next) {
			var form = { email: _user.email };
			express.post('/api/resets').send(form).end(function (err, res) {
				should(!res.error);
				should(!res.body.err);
				next();
			});
		});
		before(function (next) {
			mongo.resets.findOne({ email: _user.email }, function (err, reset) {
				should(!err);
				_reset = reset;
				next();
			});
		});
		it("should fail with invalid id", function (next) {
			var form = { _id: '012345678901234567890123', token: _reset.token, password: '4567' };
			express.put('/api/resets').send(form).end(function (err, res) {
				should(!res.error);
				should(res.body.err);
				should(error.find(res.body.err, ecode.INVALID_DATA));
				next();
			});
		});
		it("should fail with invalid token", function (next) {
			var form = { _id: _reset._id, token: 'xxxxx', password: '4567' };
			express.put('/api/resets').send(form).end(function (err, res) {
				should(!res.error);
				should(res.body.err);
				should(error.find(res.body.err, ecode.INVALID_DATA));
				next();
			});
		});
		it("should fail with invalid password", function (next) {
			var form = { _id: _reset._id, token: _reset.token, password: '' };
			express.put('/api/resets').send(form).end(function (err, res) {
				should(!res.error);
				should(res.body.err);
				should(error.find(res.body.err, ecode.PASSWORD_EMPTY));
				next();
			});
		});
		it("should fail with invalid password", function (next) {
			var form = { _id: _reset._id, token: _reset.token, password: 'xx' };
			express.put('/api/resets').send(form).end(function (err, res) {
				should(!res.error);
				should(res.body.err);
				should(error.find(res.body.err, ecode.PASSWORD_RANGE));
				next();
			});
		});
		it("should success", function (next) {
			var form = { _id: _reset._id, token: _reset.token, password: '4321' };
			express.put('/api/resets').send(form).end(function (err, res) {
				should(!res.error);
				should(!res.body.err);
				next();
			});
		});
	});
	describe("validating password 1234", function () {
		it("should success because password ARE NOT changed", function (next) {
			mongo.findUserByEmail(_user.email, function (err, user) {
				should(!err);
				should(userl.validatePassword(_user.password, user.hash));
				next();
			});
		});
	});
	describe("validating password 4321", function () {
		it("should fail", function (next) {
			mongo.findUserByEmail(_user.email, function (err, user) {
				should(!err);
				should(!userl.validatePassword('4321', user.hash));
				next();
			});
		});
	});
});