var init = require('../main/init');
var userl = require('../main/user');
var mongo = require('../main/mongo');

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
		userl.findUserByEmailAndCache(form.email, form.password, function (err, user) {
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
		});
	};

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

	exports.setLocals = function (req, res, next) {
		if (req.session.uid) {
			userl.findCachedUser(req.session.uid, function (err, user) {
				if (err) return next(err);
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
		userl.findUserByEmailAndCache(email, password, function (err, user) {
			if (err) return next(err);
			if (!user) {
				res.clearCookie(email);
				res.clearCookie(password);
				return next();
			}
			res.locals.user = user;
			createSession(req, user, next);
		});
	};

});
