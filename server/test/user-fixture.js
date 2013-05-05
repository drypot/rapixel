var should = require('should');

var init = require('../main/init');
var user = require('../main/user');
var error = require('../main/error');
var express = require('../main/express');

init.add(function () {

	exports.createFixtures = function (next) {
		var form = { name: 'snowman', email: 'abc@def.com', password: '1234' };
		user.createUser(form, function (err, u) {
			should(!err);
			u.password = '1234';
			exports.user1 = u;
			var form = { name: 'snowman2', email: 'abc2@def.com', password: '1234' };
			user.createUser(form, function (err, u) {
				should(!err);
				u.password = '1234';
				exports.user2 = u;
				var form = { name: 'admin', email: 'admin@def.com', password: '1234', admin: true };
				user.createUser(form, function (err, u) {
					should(!err);
					u.password = '1234';
					exports.admin = u;
					next();
				});
			});
		});
	};

	exports.logout = function (next) {
		express.del('/api/sessions', function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			next();
		});
	}

	exports.loginUser1 = function (next) {
		var form = { email: exports.user1.email, password: exports.user1.password };
		express.post('/api/sessions').send(form).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			next();
		});
	};

	exports.loginUser2 = function (next) {
		var form = { email: exports.user2.email, password: exports.user1.password };
		express.post('/api/sessions').send(form).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			next();
		});
	};

	exports.loginAdmin = function (next) {
		var form = { email: exports.admin.email , password: exports.admin.password };
		express.post('/api/sessions').send(form).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			next();
		});
	};

});
