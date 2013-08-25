var should = require('should');

var init = require('../lang/init');
var error = require('../error/error');
var config = require('../config/config')({ path: 'config/rapixel-test.json' });
var mongo = require('../mongo/mongo')({ dropDatabase: true });
var express = require('../express/express');
var usera = require('../user/user-auth');
var userc = require('../user/user-create');
var userv = require('../user/user-view');
var userf = require('../user/user-fixture');

before(function (next) {
	init.run(next);
});

before(function () {
	express.listen();
});

describe("finding user", function () {
	var _user = { name: 'test', email: 'test@def.com', password: '1234'  };
	it("given new user", function (next) {
		express.post('/api/users').send(_user).end(function (err, res) {
			should(!res.error);
			should(!res.body.err);
			_user._id = res.body.id;
			next();
		});
	});
	it("given login", function (next) {
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
	it("given other's login", function (next) {
		userf.loginUser2(next);
	});
	it("should not return email", function (next) {
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
	it("given admin login", function (next) {
		userf.loginAdmin(next);
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
	it("given no login", function (next) {
		express.del('/api/sessions', function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			next();
		})
	});
	it("should not return email", function (next) {
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
	it("should fail with invalid id", function (next) {
		express.get('/api/users/999').end(function (err, res) {
			should(!err);
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, error.USER_NOT_FOUND));
			next();
		});
	});
});
