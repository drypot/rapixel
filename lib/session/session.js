var init = require('../lang/init');
var userl = require('../user/user');
var mongo = require('../mongo/mongo');
var error = require('../error/error');
var ecode = require('../error/ecode');

init.add(function () {

	console.log('session:');

	exports.makeSessionForm = function (req) {
		var form = {};
		form.email = String(req.body.email || '').trim();
		form.password = String(req.body.password || '').trim();
		form.remember = !!req.body.remember;
		return form;
	};

	exports.createSession = function (req, res, form, next) {
		userl.findUserByEmailAndCache(form.email, function (err, user) {
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
				createSession(req, user, next);
			})
		});
	};

	function validateUser(user, password, next) {
		if (!user) {
			return next(error(ecode.EMAIL_NOT_FOUND));
		}
		if (user.status == 'd') {
			return next(error(ecode.ACCOUNT_DEACTIVATED));
		}
		if (!userl.validatePassword(password, user.hash)) {
			return next(error(ecode.PASSWORD_WRONG));
		}
		next();
	}

	function createSession(req, user, next) {
		req.session.regenerate(function (err) {
			if (err) return next(err);
			var now = new Date();
			mongo.updateUserAdate(user._id, now, function (err) {
				if (err) return next(err);
				user.adate = now;
				req.session.uid = user._id;
				next(null, user);
			});
		});
	}

	exports.delSession = function (req, res) {
		res.clearCookie('email');
		res.clearCookie('password');
		req.session.destroy();
	};

	exports.setLocals = function (req, res, next) {
		if (req.session.uid) {
			userl.findCachedUser(req.session.uid, function (err, user) {
				if (err) {
					req.session.destroy();
					return next(err);
				}
				res.locals.user = user;
				next();
			});
			return;
		}
		if (res.locals.api) {
			return next();
		}
		var email = req.cookies.email;
		var password = req.cookies.password;
		if (!email || !password) {
			return next();
		}
		userl.findUserByEmailAndCache(email, function (err, user) {
			if (err) return next(err);
			validateUser(user, password, function (err) {
				if (err) {
					res.clearCookie('email');
					res.clearCookie('password');
					return next();
				}
				res.locals.user = user;
				createSession(req, user, next);
			});
		});
	};

});
