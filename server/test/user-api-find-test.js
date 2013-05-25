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
		before(function (next) {
			ufix.logout(next);
		});
		it("should return user info except email", function (next) {
			express.get('/api/users/' + ufix.user1._id).end(function (err, res) {
				should(!err);
				should(!res.error);
				should(!res.body.err);
				res.body.user._id.should.equal(ufix.user1._id);
				res.body.user.name.should.equal(ufix.user1.name);
				res.body.user.profile.should.equal(ufix.user1.profile);
				should(!res.body.user.email);
				next();
			});
		});
	});
	describe("with user1 login", function () {
		before(function (next) {
			ufix.loginUser1(next);
		});
		it("should return user1 info including email", function (next) {
			express.get('/api/users/' + ufix.user1._id).end(function (err, res) {
				should(!err);
				should(!res.error);
				should(!res.body.err);
				res.body.user._id.should.equal(ufix.user1._id);
				res.body.user.name.should.equal(ufix.user1.name);
				res.body.user.profile.should.equal(ufix.user1.profile);
				res.body.user.email.should.equal(ufix.user1.email);
				next();
			});
		});
	});
	describe("with user2 login", function () {
		before(function (next) {
			ufix.loginUser2(next);
		});
		it("should return user1 info except email", function (next) {
			express.get('/api/users/' + ufix.user1._id).end(function (err, res) {
				should(!err);
				should(!res.error);
				should(!res.body.err);
				res.body.user._id.should.equal(ufix.user1._id);
				res.body.user.name.should.equal(ufix.user1.name);
				res.body.user.profile.should.equal(ufix.user1.profile);
				should(!res.body.user.email);
				next();
			});
		});
	});
	describe("with admin login", function () {
		before(function (next) {
			ufix.loginAdmin(next);
		});
		it("should return user1 info including email", function (next) {
			express.get('/api/users/' + ufix.user1._id).end(function (err, res) {
				should(!err);
				should(!res.error);
				should(!res.body.err);
				res.body.user._id.should.equal(ufix.user1._id);
				res.body.user.name.should.equal(ufix.user1.name);
				res.body.user.profile.should.equal(ufix.user1.profile);
				res.body.user.email.should.equal(ufix.user1.email);
				next();
			});
		});
	});

});