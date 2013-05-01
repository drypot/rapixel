var init = require('../main/init');
var config = require('../main/config');
var auth = require('../main/auth');
var express = require('../main/express');
var error = require('../main/error');

init.add(function () {

	var app = express.app;

	console.log('session-api:');

	app.get('/api/sessions', function (req, res) {
		req.role(function (err, role) {
			if (err) {
				return res.jsonErr(err);
			}
			res.json({
				role: {
					name: role.name,
					categoriesForMenu: role.categoriesForMenu
				},
				uploadUrl: config.data.uploadUrl
			});
		});
	});

	app.post('/api/sessions', function (req, res) {
		var role = auth.roleByPassword(req.body.password || '');
		if (!role) {
			return res.jsonErr(error(error.INVALID_PASSWORD));
		}
		req.session.regenerate(function (err) {
			if (err) return res.jsonErr(err);
			if (req.cookies && req.cookies.lv3) {
				res.clearCookie('lv3');
				res.clearCookie('lv');
				res.clearCookie('ph');
				res.clearCookie('uname');
			}
			req.session.roleName = role.name;
			req.session.posts = [];
			res.json({
				role: {
					name: role.name
				}
			});
		});
	});

	app.del('/api/sessions', function (req, res) {
		req.session.destroy();
		res.jsonEmpty();
	});

	app.configure('development', function () {
		app.put('/api/test/session', function (req, res) {
			for (var key in req.body) {
				req.session[key] = req.body[key];
			}
			res.json('ok');
		});

		app.get('/api/test/session', function (req, res) {
			var obj = {};
			for (var i = 0; i < req.body.length; i++) {
				var key = req.body[i];
				obj[key] = req.session[key];
			}
			res.json(obj);
		});

		app.get('/api/test/auth/any', function (req, res) {
			req.role(function (err) {
				if (err) return res.jsonErr(err);
				res.jsonEmpty();
			})
		});

		app.get('/api/test/auth/user', function (req, res) {
			req.role('user', function (err) {
				if (err) return res.jsonErr(err);
				res.jsonEmpty();
			});
		});

		app.get('/api/test/auth/admin', function (req, res) {
			req.role('admin', function (err) {
				if (err) return res.jsonErr(err);
				res.jsonEmpty();
			});
		});
	});

});
