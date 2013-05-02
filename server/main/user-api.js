var bcrypt = require('bcrypt');

var init = require('../main/init');
var config = require('../main/config');
var auth = require('../main/auth');
var mongo = require('../main/mongo');
var express = require('../main/express');
var error = require('../main/error');

init.add(function () {

	var app = express.app;

	console.log('users-api:');

	var emailPattern = /^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)+$/i

//	app.get('/api/users', function (req, res) {
//	});

	app.post('/api/users', function (req, res) {
		var body = req.body;
		var name = String(body.name || '').trim();
		var email = String(body.email || '').trim();
		var password = String(body.password || '').trim();
		var fields = [];

		if (!name.length) {
			fields.push({ name: 'name', msg: error.msg.NAME_EMPTY });
		}
		if (name.length > 32 || name.length < 2) {
			fields.push({ name: 'name', msg: error.msg.NAME_RANGE });
		}
		if (!email.length) {
			fields.push({ name: 'email', msg: error.msg.EMAIL_EMPTY });
		}
		if (email.length > 64 || email.length < 8) {
			fields.push({ name: 'email', msg: error.msg.EMAIL_RANGE });
		}
		if (!emailPattern.test(email)) {
			fields.push({ name: 'email', msg: error.msg.EMAIL_PATTERN });
		}
		if (!password.length) {
			fields.push({ name: 'password', msg: error.msg.PASSWORD_EMPTY });
		}
		if (password.length > 32 || password.length < 4) {
			fields.push({ name: 'password', msg: error.msg.PASSWORD_RANGE });
		}
		if (fields.length) {
			return sendFieldError(res, fields);
		}

		mongo.findUserByName(name, function (err, user) {
			if (err) return res.jsonErr(err);
			if (user) {
				fields.push({ name: 'name', msg: error.msg.NAME_DUPE });
				return sendFieldError(res, fields);
			}
			mongo.findUserByEmail(email, function (err, user) {
				if (err) return res.jsonErr(err);
				if (user) {
					fields.push({ name: 'email', msg: error.msg.EMAIL_DUPE });
					return sendFieldError(res, fields);
				}
				var now = new Date();
				var newUser = {
					name: name,
					email: email,
					hash: bcrypt.hashSync(password, 10),
					status: 'v',
					cdate: now,
					adate: now,
					pdate: null,
					disk: 0,
					profile: ''
				};
				mongo.insertUser(newUser, function (err) {
					if (err) return res.jsonErr(err);
					res.jsonEmpty();
				});
			});
		});
	});

	function sendFieldError(res, fields) {
		res.jsonErr(error({ rc: error.INVALID_DATA, fields: fields }));
	}

//	app.del('/api/users', function (req, res) {
//		res.jsonEmpty();
//	});

});
