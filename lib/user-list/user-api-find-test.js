var should = require('should');
var request = require('superagent').agent();

var init = require('../lang/init');
var config = require('../config/config')({ path: 'config/test.json' });
var mongo = require('../mongo/mongo')({ dropDatabase: true });
var express = require('../express/express');
var error = require('../error/error');
var ecode = require('../error/ecode');
var userfix = require('../user/user-fixture');

require('../main/session-api');
require('../user/user-api');

before(function (next) {
	init.run(next);
});

before(function () {
	express.listen();
});

before(function (next) {
	userfix.create(next);
});

describe("finding user", function () {
	describe("given new user", function () {
		var _user = { name: 'test', email: 'test@def.com', password: '1234'  };
		before(function (next) {
			express.post('/api/users').send(_user).end(function (err,res) {
				should(!res.error);
				should(!res.body.err);
				_user._id = res.body.user._id;
				next();
			});
		});
		it("should fail with invalid id", function (next) {
			express.get('/api/users/999').end(function (err, res) {
				should(!err);
				should(!res.error);
				should(res.body.err);
				should(error.find(res.body.err, ecode.USER_NOT_FOUND));
				next();
			});
		});
		describe("with no login", function () {
			it("should return user info except email", function (next) {
				express.get('/api/users/' + _user._id).end(function (err, res) {
					should(!err);
					should(!res.error);
					should(!res.body.err);
					res.body.user._id.should.equal(_user._id);
					res.body.user.name.should.equal(_user.name);
					res.body.user.profile.should.equal('');
					should(!res.body.user.email);
					next();
				});
			});
		});
		describe("with login", function () {
			before(function (next) {
				var form = { email: _user.email, password: _user.password };
				express.post('/api/sessions').send(form).end(function (err, res) {
					should(!res.error);
					should(!res.body.err);
					next();
				});
			});
			it("should return email", function (next) {
				express.get('/api/users/' + _user._id).end(function (err, res) {
					should(!err);
					should(!res.error);
					should(!res.body.err);
					res.body.user._id.should.equal(_user._id);
					res.body.user.name.should.equal(_user.name);
					res.body.user.email.should.equal(_user.email);
					next();
				});
			});
		});
		describe("with other's login", function () {
			before(function (next) {
				userfix.loginUser2(next);
			});
			it("should return user info except email", function (next) {
				express.get('/api/users/' + _user._id).end(function (err, res) {
					should(!err);
					should(!res.error);
					should(!res.body.err);
					res.body.user._id.should.equal(_user._id);
					res.body.user.name.should.equal(_user.name);
					should(!res.body.user.email);
					next();
				});
			});
		});
		describe("with admin login", function () {
			before(function (next) {
				userfix.loginAdmin(next);
			});
			it("should return email", function (next) {
				express.get('/api/users/' + _user._id).end(function (err, res) {
					should(!err);
					should(!res.error);
					should(!res.body.err);
					res.body.user._id.should.equal(_user._id);
					res.body.user.name.should.equal(_user.name);
					res.body.user.email.should.equal(_user.email);
					next();
				});
			});
		});
	});
});