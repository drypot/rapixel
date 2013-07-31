var should = require('should');

var init = require('../lang/init');
var config = require('../config/config')({ path: 'config/test.json' });
var mongo = require('../mongo/mongo')({ dropDatabase: true });
var express = require('../express/express');
var userb = require('../user/user-base');
var usera = require('../user/user-auth');
var userf = require('../user/user-fixture');
var userd = require('../user/user-deactivate');
var error = require('../error/error');
var ecode = require('../error/ecode');

init.add(function () {
	var app = express.app;

	app.get('/test/user', function (req, res) {
		usera.getUser(res, function (err, user) {
			if (err) return express.jsonErr(res, err);
			res.json({});
		});
	});
});

before(function (next) {
	init.run(next);
});

before(function () {
	express.listen();
});

before(function (next) {
	userf.create(next);
});

describe("deactivating self", function () {
	it("given user1 login", function (next) {
		userf.loginUser1(next);
	});
	it("should success accessing user resource", function (next) {
		express.get('/test/user').end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			next();
		})
	});
	it("should success deactivating user1", function (next) {
		express.del('/api/users/' + userf.user1._id).end(function (err, res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
	it("can be confirmed", function (next) {
		mongo.users.findOne({ _id: userf.user1._id }, function (err, user) {
			should(!err);
			should(user.status == 'd');
			next();
		});
	});
	it("should fail accessing user resource (because logged out)", function (next) {
		express.get('/test/user').end(function (err, res) {
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, ecode.NOT_AUTHENTICATED));
			next();
		});
	});
});

describe("deactivating with no login", function () {
	it("given no login", function (next) {
		userf.logout(next);
	});
	it("should fail deactivating user2", function (next) {
		express.del('/api/users/' + userf.user2._id).end(function (err, res) {
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, ecode.NOT_AUTHENTICATED));
			next();
		});
	});
});

describe("deactivating other", function () {
	it("given user2 login", function (next) {
		userf.loginUser2(next);
	});
	it("should fail deactivating user3", function (next) {
		express.del('/api/users/' + userf.user3._id).end(function (err, res) {
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, ecode.NOT_AUTHORIZED));
			next();
		});
	});
});

describe("deactivating by admin", function () {
	it("given admin login", function (next) {
		userf.loginAdmin(next);
	});
	it("should success deactivating user3", function (next) {
		express.del('/api/users/' + userf.user3._id).end(function (err, res) {
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
});

