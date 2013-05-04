var bcrypt = require('bcrypt');

var init = require('../main/init');
var config = require('../main/config');
var user = require('../main/user');
var mongo = require('../main/mongo');
var express = require('../main/express');
var error = require('../main/error');

init.add(function () {

	var app = express.app;

	console.log('session-api:');

	app.post('/api/sessions', function (req, res) {
		var email = String(req.body.email || '').trim();
		var password = String(req.body.password || '').trim();

		mongo.findUserByEmail(email, function (err, u) {
			if (err) return res.jsonErr(err);
			if (!u || !bcrypt.compareSync(password, u.hash)) {
				return res.jsonErr(error(error.INVALID_PASSWORD));
			}
			req.session.regenerate(function (err) {
				if (err) return res.jsonErr(err);
				var now = new Date();
				mongo.updateUserAdate(u._id, now, function (err) {
					if (err) return res.jsonErr(err);
					u.adate = now;
					user.cacheUser(u);
					req.session.userId = u._id;
					res.json({
						name: u.name
					});
				});
			});
		})
	});

	app.del('/api/sessions', function (req, res) {
		req.session.destroy();
		res.jsonEmpty();
	});

});
