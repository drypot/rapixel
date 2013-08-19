var init = require('../lang/init');
var error = require('../error/error');
var mongo = require('../mongo/mongo');
var express = require('../express/express');
var userc = require('../user/user-create');
var userv = require('../user/user-view');

init.add(function () {
	var app = express.app;

	app.post('/api/sessions', function (req, res) {
		var form = getForm(req.body);
		createSessionWithForm(req, res, form, function (err, user) {
			if (err) return res.jsonErr(err);
			res.json({
				user: {
					id: user._id,
					name: user.name
				}
			});
		});
	});

	app.del('/api/sessions', function (req, res) {
		exports.deleteSession(req, res);
		res.json({});
	});

	app.get('/users/login', function (req, res) {
		res.render('user-auth-login');
	});
});

function getForm(body) {
	var form = {};
	form.email = String(body.email || '').trim();
	form.password = String(body.password || '').trim();
	form.remember = !!body.remember;
	return form;
};

function createSessionWithForm(req, res, form, next) {
	userv.findAndCache(form.email, function (err, user) {
		if (err) return next(err);
		validateUser(user, form.password, function (err) {
			if (err) return next(err);
			if (form.remember) {
				res.cookie('email', form.email, {
					maxAge: 99 * 365 * 24 * 60 * 60 * 1000,
					httpOnly: true
				});
				res.cookie('password', form.password, {
					maxAge: 99 * 365 * 24 * 60 * 60 * 1000,
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
		return userv.getCached(req.session.uid, function (err, user) {
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
	userv.findAndCache(email, function (err, user) {
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
		return next(error(error.ids.EMAIL_NOT_FOUND));
	}
	if (user.status == 'd') {
		return next(error(error.ids.ACCOUNT_DEACTIVATED));
	}
	if (!userc.checkPassword(password, user.hash)) {
		return next(error(error.ids.PASSWORD_WRONG));
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

exports.deleteSession = function (req, res) {
	res.clearCookie('email');
	res.clearCookie('password');
	req.session.destroy();
};

exports.getUser = function (res, next) {
	var user = res.locals.user;
	if (!user) {
		return next(error(error.ids.NOT_AUTHENTICATED));
	}
	next(null, user);
};

exports.getAdmin = function (res, next) {
	var user = res.locals.user;
	if (!user) {
		return next(error(error.ids.NOT_AUTHENTICATED));
	}
	if (!user.admin) {
		return next(error(error.ids.NOT_AUTHORIZED));
	}
	next(null, user);
};
