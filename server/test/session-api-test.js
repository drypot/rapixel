var should = require('should');

var init = require('../main/init');
var config = require('../main/config')({ test: true });
var mongo = require('../main/mongo')({ dropDatabase: true });
var express = require('../main/express');
var error = require('../main/error');
var ecode = require('../main/ecode');
var ufix = require('../test/user-fixture');

require('../main/session-api');
require('../main/user-api');

init.add(function () {

	var app = express.app;

	app.get('/test/user', function (req, res) {
		req.findUser(function (err) {
			if (err) return res.jsonErr(err);
			res.json({});
		});
	});

	app.get('/test/admin', function (req, res) {
		req.findAdmin(function (err) {
			if (err) return res.jsonErr(err);
			res.json({});
		});
	});

	app.del('/test/del-session', function (req, res) {
		req.session.destroy();
		res.json({});
	});

});

before(function (next) {
	init.run(next);
});

before(function (next) {
	ufix.createFixtures(next);
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
			should(error.find(res.body.err, ecode.EMAIL_NOT_FOUND))
			next();
		})
	});
	it("should fail with invalid password", function (next) {
		var form = { email: ufix.user1.email, password: 'xxxx' };
		express.post('/api/sessions').send(form).end(function (err, res) {
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, ecode.EMAIL_NOT_FOUND))
			next();
		})
	});
	it("should success", function (next) {
		var form = { email: ufix.user1.email, password: ufix.user1.password };
		express.post('/api/sessions').send(form).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			res.body.user.name.should.equal(ufix.user1.name);
			next();
		})
	});
});

describe("accessing user resource", function () {
	describe("given no session", function () {
		before(function (next) {
			ufix.logout(next);
		});
		it("should fail", function (next) {
			express.get('/test/user').end(function (err, res) {
				should(!err);
				should(!res.error);
				should(res.body.err);
				should(error.find(res.body.err, ecode.NOT_AUTHENTICATED))
				next();
			})
		});
	});
	describe("given user session", function () {
		before(function (next) {
			ufix.loginUser1(next);
		});
		it("should success", function (next) {
			express.get('/test/user').end(function (err, res) {
				should(!err);
				should(!res.error);
				should(!res.body.err);
				next();
			})
		});
	});
});

describe("accessing admin resource", function () {
	describe("given no session", function () {
		before(function (next) {
			ufix.logout(next);
		});
		it("should fail", function (next) {
			express.get('/test/admin').end(function (err, res) {
				should(!err);
				should(!res.error);
				should(res.body.err);
				should(error.find(res.body.err, ecode.NOT_AUTHENTICATED))
				next();
			});
		});
	});
	describe("given user session", function () {
		before(function (next) {
			ufix.loginUser1(next);
		});
		it("should fail", function (next) {
			express.get('/test/admin').end(function (err, res) {
				should(!err);
				should(!res.error);
				should(res.body.err);
				should(error.find(res.body.err, ecode.NOT_AUTHORIZED))
				next();
			});
		});
	});
	describe("given admin session", function () {
		before(function (next) {
			ufix.loginAdmin(next);
		});
		it("should fail", function (next) {
			express.get('/test/admin').end(function (err, res) {
				should(!err);
				should(!res.error);
				should(!res.body.err);
				next();
			})
		});
	});
});

describe("accessing /test/user with auto login", function () {
	describe("given new test session", function () {
		before(function (next) {
			express.newTestSession();
			next();
		});
		it("should fail", function (next) {
			express.get('/test/user').end(function (err, res) {
				should(!err);
				should(!res.error);
				should(res.body.err);
				next();
			});
		});
	});
	describe("given user session", function () {
		before(function (next) {
			ufix.loginUser1(next);
		});
		it("should success", function (next) {
			express.get('/test/user').end(function (err, res) {
				should(!err);
				should(!res.error);
				should(!res.body.err);
				next();
			})
		});
	});
	describe("given new test sesssion", function () {
		before(function (next) {
			express.newTestSession();
			next();
		});
		it("should fail", function (next) {
			express.get('/test/user').end(function (err, res) {
				should(!err);
				should(!res.error);
				should(res.body.err);
				next();
			})
		});
	});
	describe("given user session with auto login", function () {
		before(function (next) {
			ufix.loginUser1WithRemember(next)
		});
		it("should success", function (next) {
			express.get('/test/user').end(function (err, res) {
				should(!err);
				should(!res.error);
				should(!res.body.err);
				next();
			});
		});
	});
	describe("given new session", function () {
		before(function (next) {
			express.del('/test/del-session').end(function (err, res) {
				should(!err);
				should(!res.error);
				should(!res.body.err);
				next();
			});
		});
		it("should success", function (next) {
			express.get('/test/user').end(function (err, res) {
				should(!err);
				should(!res.error);
				should(!res.body.err);
				next();
			});
		});
	});
	describe("given logged out", function () {
		before(function (next) {
			ufix.logout(next);
		});
		it("should fail", function (next) {
			express.get('/test/user').end(function (err, res) {
				should(!err);
				should(!res.error);
				should(res.body.err);
				next();
			})
		});
	});
});