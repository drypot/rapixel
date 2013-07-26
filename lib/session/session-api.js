var init = require('../lang/init');
var session = require('../main/session');
var express = require('../express/express');

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
		session.delSession(req, res);
		res.json({});
	});

});
