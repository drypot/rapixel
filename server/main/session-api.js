var init = require('../main/init');
var session = require('../main/session');
var express = require('../main/express');

init.add(function () {

	var app = express.app;

	console.log('session-api:');

	app.post('/api/sessions', function (req, res) {
		var form = session.makeSessionForm(req);
		session.createSession(req, res, form, function (err, user) {
			if (err) return res.jsonErr(err);
			res.json({
				user: {
					name: user.name
				}
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
