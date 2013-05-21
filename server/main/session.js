var init = require('../main/init');
var userl = require('../main/user');
var mongo = require('../main/mongo');

init.add(function () {

	console.log('session:');

	exports.initSession = function (req, user, next) {
		req.session.regenerate(function (err) {
			if (err) return next(err);
			var now = new Date();
			mongo.updateUserAdate(user._id, now, function (err) {
				if (err) return next(err);
				user.adate = now;
				req.session.uid = user._id;
				next();
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
		autoLogin(req, res, function (err, user) {
			if (err) return next(err);
			if (user) {
				res.locals.user = user;
			}
			next();
		});
	};

	function autoLogin(req, res, next) {
		var email = req.cookies.email;
		var password = req.cookies.password;
		if (!email || !password) {
			return next();
		}
		userl.findCachedUserByEmail(email, password, function (err, user) {
			if (err) {
				if (err.rc == error.INVALID_PASSWORD) {
					res.clearCookie(email);
					res.clearCookie(password);
					return next();
				}
				return next(err);
			}
			exports.initSession(req, user, function (err) {
				if (err) return next(err);
				next(null, user);
			});
		});
	}

});
