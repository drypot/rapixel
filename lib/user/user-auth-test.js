var should = require('should');

var init = require('../lang/init');
var error = require('../error/error');
var config = require('../config/config')({ path: 'config/rapixel-test.json' });
var mongo = require('../mongo/mongo')({ dropDatabase: true });
var express = require('../express/express');
var userb = require('../user/user-base');
var usera = require('../user/user-auth');
var userf = require('../user/user-fixture');

init.add(function () {
	var app = express.app;

	app.get('/test/user', function (req, res) {
		usera.getUser(res, function (err, user) {
			if (err) return res.jsonErr(err);
			res.json({});
		});
	});

	app.get('/test/admin', function (req, res) {
		usera.getAdmin(res, function (err, user) {
			if (err) return res.jsonErr(err);
			res.json({});
		});
	});

	app.get('/test/cookies', function (req, res) {
		res.json({
			email: req.cookies.email,
			password: req.cookies.password
		});
	});

	app.delete('/test/del-session', function (req, res) {
		req.session.destroy();
		res.json({});
	});
});

before(function (next) {
	init.run(next);
});

before(function () {
	express.listen();
});

describe("login", function () {
	it("should success", function (next) {
		var form = { email: userf.user1.email, password: userf.user1.password };
		express.post('/api/sessions').send(form).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			res.body.user.id.should.equal(userf.user1._id);
			res.body.user.name.should.equal(userf.user1.name);
			next();
		})
	});
	it("should fail with invalid email", function (next) {
		var form = { email: 'xxx@xxx.com', password: 'xxxx' };
		express.post('/api/sessions').send(form).end(function (err, res) {
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, error.EMAIL_NOT_FOUND));
			next();
		})
	});
	it("should fail with invalid password", function (next) {
		var form = { email: userf.user1.email, password: 'xxxx' };
		express.post('/api/sessions').send(form).end(function (err, res) {
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, error.PASSWORD_WRONG));
			next();
		})
	});
});

describe("accessing user resource", function () {
	it("given user session", function (next) {
		userf.loginUser1(next);
	});
	it("should success", function (next) {
		express.get('/test/user').end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			next();
		})
	});
	it("given no session", function (next) {
		userf.logout(next);
	});
	it("should fail", function (next) {
		express.get('/test/user').end(function (err, res) {
			should(!err);
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, error.NOT_AUTHENTICATED))
			next();
		})
	});
});

describe("accessing admin resource", function () {
	it("given admin session", function (next) {
		userf.loginAdmin(next);
	});
	it("should success", function (next) {
		express.get('/test/admin').end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			next();
		})
	});
	it("given no session", function (next) {
		userf.logout(next);
	});
	it("should fail", function (next) {
		express.get('/test/admin').end(function (err, res) {
			should(!err);
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, error.NOT_AUTHENTICATED))
			next();
		});
	});
	it("given user session", function (next) {
		userf.loginUser1(next);
	});
	it("should fail", function (next) {
		express.get('/test/admin').end(function (err, res) {
			should(!err);
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, error.NOT_AUTHORIZED))
			next();
		});
	});
});

describe("accessing user resouce ", function () {
	describe("with out auto login", function () {
		it("given new test session", function (next) {
			express.resetTestSession();
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
		it("given user session", function (next) {
			userf.loginUser1(next);
		});
		it("should success", function (next) {
			express.get('/test/user').end(function (err, res) {
				should(!err);
				should(!res.error);
				should(!res.body.err);
				next();
			});
		});
		it("given new session", function (next) {
			express.del('/test/del-session').end(function (err, res) {
				should(!err);
				should(!res.error);
				should(!res.body.err);
				next();
			});
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
	describe("with auto login", function () {
		it("given new test sesssion",function (next) {
			express.resetTestSession();
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
		it("given user session with auto login", function (next) {
			userf.loginUser1WithRemember(next);
		});
		it("should success", function (next) {
			express.get('/test/user').end(function (err, res) {
				should(!err);
				should(!res.error);
				should(!res.body.err);
				next();
			});
		});
		it("given new session", function (next) {
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
		it("given logged out", function (next) {
			userf.logout(next);
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
	describe("with auto login with invalid email", function () {
		it("given new test sesssion",function (next) {
			express.resetTestSession();
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
		it("given user session with auto login", function (next) {
			userf.loginUser1WithRemember(next);
		});
		it("should success", function (next) {
			express.get('/test/user').end(function (err, res) {
				should(!err);
				should(!res.error);
				should(!res.body.err);
				next();
			});
		});
		it("checking email cookie", function (next) {
			express.get('/test/cookies').end(function (err, res) {
				should(!err);
				should(!res.error);
				should(!res.body.err);
				res.body.email.should.equal(userf.user1.email);
				next();
			});
		});
		it("given email changed", function (next) {
			var fields = {
				email: "new@def.com"
			};
			userb.users.update({ _id: userf.user1._id }, fields, function (err, cnt) {
				should(!err);
				should(cnt);
				next();
			});
		});
		it("given new session", function (next) {
			express.del('/test/del-session').end(function (err, res) {
				should(!err);
				should(!res.error);
				should(!res.body.err);
				next();
			});
		});
		it("should fail", function (next) {
			express.get('/test/user').end(function (err, res) {
				should(!err);
				should(!res.error);
				should(res.body.err);
				next();
			});
		});
		it("checking email cookie is null", function (next) {
			express.get('/test/cookies').end(function (err, res) {
				should(!err);
				should(!res.error);
				should(!res.body.err);
				should(!res.body.email);
				next();
			});
		});
	});
});