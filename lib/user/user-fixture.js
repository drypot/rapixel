var should = require('should');

var init = require('../lang/init');
var userl = require('../user/user');
var express = require('../express/express');

init.add(function () {

	exports.createFixtures = function (next) {
		var forms = [
			{ en:'user1', name: 'testuser', email: 'abc@def.com', password: '1234' },
			{ en:'user2', name: 'testuser2', email: 'abc2@def.com', password: '1234' },
			{ en:'admin', name: 'testadmin', email: 'admin@def.com', password: '1234', admin: true }
		];
		var i = 0;
		function create() {
			if (i == forms.length) return next();
			var form = forms[i++];
			userl.createUser(form, function (err, user) {
				should(!err);
				user.password = form.password;
				exports[form.en] = user;
				setImmediate(create);
			});
		}
		create();
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

	exports.loginUser1WithRemember = function (next) {
		var form = { email: exports.user1.email, password: exports.user1.password, remember: true };
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
