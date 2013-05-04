var init = require('../main/init');
var user = require('../main/user');
var express = require('../main/express');

init.add(function () {

	var app = express.app;

	console.log('users-api:');

//	app.get('/api/users', function (req, res) {
//	});

	app.post('/api/users', function (req, res) {
		var form = {};
		form.name = String(req.body.name || '').trim();
		form.email = String(req.body.email || '').trim();
		form.password = String(req.body.password || '').trim();
		user.createUser(form, function (err, u) {
			if (err) return res.jsonErr(err);
			res.json({
				userId: u._id
			});
		});
	});

//	app.del('/api/users', function (req, res) {
//		res.jsonEmpty();
//	});

});
