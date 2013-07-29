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


	// 사용자 확인을 미들웨어로 할 경우 리턴 형식을 결정하기 어려워진다.
	// res.locals.api 로 확인할 수 없다.
	// /upload 같은 경우 html url 이지만 json 을 리턴해야 한다.

	// TODO: /upload 를 /api/upload 로 이동하면?

	// TODO: checkUser 를 session 으로
	
	app.request.checkUser = function (next) {
		var req = this;
		var res = this.res;
		var user = res.locals.user;
		if (!user) {
			return next(error(ecode.NOT_AUTHENTICATED));
		}
		next(null, user);
	};

	app.request.checkAdmin = function (next) {
		var req = this;
		var res = this.res;
		var user = res.locals.user;
		if (!user) {
			return next(error(ecode.NOT_AUTHENTICATED));
		}
		if (!user.admin) {
			return next(error(ecode.NOT_AUTHORIZED));
		}
		next(null, user);
	};
});