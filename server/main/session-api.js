var init = require('../main/init');
var userl = require('../main/user');
var session = require('../main/session');
var express = require('../main/express');
var error = require('../main/error');

init.add(function () {

	var app = express.app;

	console.log('session-api:');

	app.post('/api/sessions', function (req, res) {
		var email = String(req.body.email || '').trim();
		var password = String(req.body.password || '').trim();
		userl.findCachedUserByEmail(email, password, function (err, user) {
			if (err) return res.jsonErr(err);
			if (req.body.remember) {
				res.cookie('email', email, {
					maxAge: 30 * 24 * 60 * 60 * 1000,
					httpOnly: true
				});
				res.cookie('password', password, {
					maxAge: 30 * 24 * 60 * 60 * 1000,
					httpOnly: true
				});
			}
			session.initSession(req, user, function (err) {
				if (err) return res.jsonErr(err);
				res.json({
					user: {
						name: user.name
					}
				});
			});
		});
	});

	app.del('/api/sessions', function (req, res) {
		res.clearCookie('email');
		res.clearCookie('password');
		req.session.destroy();
		res.json({});
	});

});
