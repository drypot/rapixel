var init = require('../lang/init');
var mongo = require('../mongo/mongo');
var express = require('../express/express');
var userb = require('../user-base/user-base');
var error = require('../error/error');
var ecode = require('../error/ecode');

init.add(function () {
	var app = express.app;

	app.post('/api/sessions', function (req, res) {
		var form = makeForm(req.body);
		createSessionWithForm(req, res, form, function (err, user) {
			if (err) return express.jsonErr(res, err);
			res.json({
				user: {
					id: user._id,
					name: user.name
				}
			});
		});
	});

	app.del('/api/sessions', function (req, res) {
		delSession(req, res);
		res.json({});
	});

	app.get('/users/login', function (req, res) {
		res.render('user-session-login');
	});
});

function makeForm(body) {
	var form = {};
	form.email = String(body.email || '').trim();
	form.password = String(body.password || '').trim();
	form.remember = !!body.remember;
	return form;
};

function createSessionWithForm(req, res, form, next) {
	userb.findAndCache(form.email, function (err, user) {
		if (err) return next(err);
		validateUser(user, form.password, function (err) {
			if (err) return next(err);
			if (form.remember) {
				res.cookie('email', form.email, {
					maxAge: 30 * 24 * 60 * 60 * 1000,
					httpOnly: true
				});
				res.cookie('password', form.password, {
					maxAge: 30 * 24 * 60 * 60 * 1000,
					httpOnly: true
				});
			}
			createSessionWithUser(req, user, function (err) {
				if (err) return next(err);
				next(null, user);
			});
		})
	});
};

express.userSession = function (req, res, next) {
	if (req.session.uid) {
		return userb.getCached(req.session.uid, function (err, user) {
			if (err) {
				req.session.destroy();
				return next(err);
			}
			res.locals.user = user;
			next();
		});
	}
	if (res.locals.api) {
		return next();
	}
	var email = req.cookies.email;
	var password = req.cookies.password;
	if (!email || !password) {
		return next();
	}
	userb.findAndCache(email, function (err, user) {
		if (err) return next(err);
		validateUser(user, password, function (err) {
			if (err) {
				res.clearCookie('email');
				res.clearCookie('password');
				return next();
			}
			createSessionWithUser(req, user, function (err) {
				if (err) return next(err);
				res.locals.user = user;
				next();
			});
		});
	});
};

function validateUser(user, password, next) {
	if (!user) {
		return next(error(ecode.EMAIL_NOT_FOUND));
	}
	if (user.status == 'd') {
		return next(error(ecode.ACCOUNT_DEACTIVATED));
	}
	if (!userb.checkPassword(password, user.hash)) {
		return next(error(ecode.PASSWORD_WRONG));
	}
	next();
}

function createSessionWithUser(req, user, next) {
	req.session.regenerate(function (err) {
		if (err) return next(err);
		var now = new Date();
		mongo.users.update({ _id: user._id }, { $set: { adate: now } }, function (err) {
			if (err) return next(err);
			user.adate = now;
			req.session.uid = user._id;
			next();
		});
	});
}

function delSession(req, res) {
	res.clearCookie('email');
	res.clearCookie('password');
	req.session.destroy();
};

exports.getUser = function (res, next) {
	var user = res.locals.user;
	if (!user) {
		return next(error(ecode.NOT_AUTHENTICATED));
	}
	next(null, user);
};

exports.getAdmin = function (res, next) {
	var user = res.locals.user;
	if (!user) {
		return next(error(ecode.NOT_AUTHENTICATED));
	}
	if (!user.admin) {
		return next(error(ecode.NOT_AUTHORIZED));
	}
	next(null, user);
};
