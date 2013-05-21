var init = require('../main/init');
var userl = require('../main/user');
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
		userl.createUser(form, function (err, user) {
			if (err) return res.jsonErr(err);
			res.json({
				user: {
					_id: user._id
				}
			});
		});
	});

//	app.del('/api/users', function (req, res) {
//		res.json({});
//	});

});
