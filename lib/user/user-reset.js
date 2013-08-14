var crypto = require('crypto');

var init = require('../lang/init');
var config = require('../config/config');
var mongo = require('../mongo/mongo');
var express = require('../express/express');
var mailer = require('../mail/mailer');
var userc = require('../user/user-create');
var error = require('../error/error');

init.add(function (next) {
	mongo.resets = mongo.db.collection("resets");
	mongo.resets.ensureIndex({ email: 1 }, next);
});

init.add(function () {
	var app = express.app;

	app.post('/api/resets', function (req, res) {
		var form = getStep1Form(req);
		step1(form, function (err) {
			if (err) return res.jsonErr(err);
			res.json({});
		});
	});

	app.put('/api/resets', function (req, res) {
		var form = getStep2Form(req);
		step2(form, function (err) {
			if (err) return res.jsonErr(err);
			res.json({});
		});
	});

	app.get('/users/reset-step1', function (req, res) {
		res.render('user-reset-step1');
	});

	app.get('/users/reset-step2', function (req, res) {
		res.render('user-reset-step2');
	});
});

function getStep1Form(req) {
	var form = {};
	form.email = String(req.body.email || '').trim();
	return form;
}

function step1(form, next) {
	var errors = [];
	userc.checkFormEmail(form, errors);
	if (errors.length) {
		return next(error(errors));
	}
	crypto.randomBytes(12, function(err, buf) {
		if (err) return next(err);
		var token = buf.toString('hex');
		mongo.users.findOne({ email: form.email }, function (err, user) {
			if (err) return next(err);
			if (!user) {
				return next(error(error.ids.EMAIL_NOT_EXIST));
			}
			mongo.resets.remove({ email: form.email }, function (err) {
				if (err) return next(err);
				var reset = {
					email: form.email,
					token: token
				};
				mongo.resets.insert(reset, function (err, resets) {
					if (err) return next(err);
					var reset = resets[0];
					var mail = {
						from: 'no-reply@raysoda.com',
						to: reset.email,
						subject: 'Reset Password - ' + config.appName,
						text:
							'\n' +
							'Open the following URL to reset your ' + config.appName + ' password.\n\n' +
							config.frontUrl + '/users/reset-step2?id=' + reset._id + '&t=' + reset.token + '\n\n' +
							config.appName
					};
					mailer.send(mail, next);
				});
			});
		});
	});
};

function getStep2Form(req) {
	var form = {};
	form.id = String(req.body.id || '').trim();
	form.token = String(req.body.token || '').trim();
	form.password = String(req.body.password || '').trim();
	return form;
}

function step2(form, next) {
	var errors = [];
	userc.checkFormPassword(form, errors);
	if (errors.length) {
		return next(error(errors));
	}
	mongo.resets.findOne({ _id: new mongo.ObjectID(form.id) }, function (err, reset) {
		if (err) return next(err);
		if (!reset) {
			return next(error(error.ids.INVALID_DATA));
		}
		if (form.token != reset.token) {
			return next(error(error.ids.INVALID_DATA));
		}
		if (Date.now() - reset._id.getTimestamp().getTime() > 15 * 60 * 1000) {
			return next(error(error.ids.RESET_TIMEOUT));
		}
		exports.updateHash(reset.email, form.password, true, function (err) {
			if (err) return next(err);
			mongo.resets.remove({ _id: reset._id }, next);
		});
	});
};

exports.updateHash = function (email, password, excludeAdmin, next) {
	var hash = userc.makeHash(password);
	var query = { email: email };
	if (excludeAdmin) {
		query.admin = { $exists: false };
	}
	mongo.users.update(query, { $set: { hash: hash } }, next)
}
