var should = require('should');

var init = require('../main/init');
var config = require('../main/config')({ test: true });
var mongo = require('../main/mongo')({ dropDatabase: true });
var express = require('../main/express');
var error = require('../main/error');
var userFix = require('../test/user-fixture');

require('../main/session-api');
require('../main/user-api');

init.add(function () {

	var app = express.app;

	app.get('/api/test/user', function (req, res) {
		req.user(function (err) {
			if (err) return res.jsonErr(err);
			res.jsonEmpty();
		});
	});

	app.get('/api/test/admin', function (req, res) {
		req.admin(function (err) {
			if (err) return res.jsonErr(err);
			res.jsonEmpty();
		});
	});

});

before(function (next) {
	init.run(next);
});

before(function (next) {
	userFix.createFixtures(next);
});

before(function () {
	express.listen();
});

describe("login", function () {
	it("should fail with invalid email", function (next) {
		var form = { email: 'xxx@xxx.com', password: 'xxxx' };
		express.post('/api/sessions').send(form).end(function (err, res) {
			should(!res.error);
			should(res.body.err);
			res.body.err.rc.should.equal(error.INVALID_PASSWORD);
			next();
		})
	});
	it("should fail with invalid password", function (next) {
		var form = { email: userFix.user1.email, password: 'xxxx' };
		express.post('/api/sessions').send(form).end(function (err, res) {
			should(!res.error);
			should(res.body.err);
			res.body.err.rc.should.equal(error.INVALID_PASSWORD);
			next();
		})
	});
	it("should success", function (next) {
		var form = { email: userFix.user1.email, password: userFix.user1.password };
		express.post('/api/sessions').send(form).end(function (err, res) {
			should(!res.error);
			should(!res.body.err);
			res.body.name.should.equal(userFix.user1.name);
			next();
		})
	});
});

describe("accessing user resource", function () {
	it("given no session", function (next) {
		userFix.logout(next);
	});
	it("should fail", function (next) {
		express.get('/api/test/user').end(function (err, res) {
			should(res.body.err);
			res.body.err.rc.should.equal(error.NOT_AUTHENTICATED);
			next();
		})
	});
	it("given user session", function (next) {
		userFix.loginUser1(next);
	});
	it("should success", function (next) {
		express.get('/api/test/user').end(function (err, res) {
			should(!res.body.err);
			next();
		})
	});
});

describe("accessing admin resource", function () {
	it("given no session", function (next) {
		userFix.logout(next);
	});
	it("should fail", function (next) {
		express.get('/api/test/admin').end(function (err, res) {
			should(res.body.err);
			res.body.err.rc.should.equal(error.NOT_AUTHENTICATED);
			next();
		})
	});
	it("given user session", function (next) {
		userFix.loginUser1(next);
	});
	it("should fail", function (next) {
		express.get('/api/test/admin').end(function (err, res) {
			should(res.body.err);
			res.body.err.rc.should.equal(error.NOT_AUTHORIZED);
			next();
		})
	});
	it("given admin session", function (next) {
		userFix.loginAdmin(next);
	});
	it("should fail", function (next) {
		express.get('/api/test/admin').end(function (err, res) {
			should(!res.body.err);
			next();
		})
	});
});