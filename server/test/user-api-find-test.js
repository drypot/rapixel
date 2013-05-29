var should = require('should');
var request = require('superagent').agent();

var init = require('../main/init');
var config = require('../main/config')({ test: true });
var mongo = require('../main/mongo')({ dropDatabase: true });
var express = require('../main/express');
var error = require('../main/error');
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
				res.body.err.rc.should.equal(error.USER_NOT_FOUND);
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
					res.body.user.footer.should.equal('');
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
				ufix.loginUser2(next);
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
				ufix.loginAdmin(next);
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