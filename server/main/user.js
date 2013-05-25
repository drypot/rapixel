var bcrypt = require('bcrypt');

var init = require('../main/init');
var mongo = require('../main/mongo');
var error = require('../main/error');

init.add(function (next) {

	var users = [];

	exports.makeForm = function (req) {
		var form = {};
		form.name = String(req.body.name || '').trim();
		form.email = String(req.body.email || '').trim();
		form.password = String(req.body.password || '').trim();
		form.profile = String(req.body.profile || '').trim();
		return form;
	}

	var emailRe = /^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)+$/i

	exports.createUser = function (form, next) {
		checkForm(form, true, function (err) {
			if (err) return next(err);
			mongo.findUserByName(form.name, function (err, user) {
				if (err) return next(err);
				if (user) {
					return next(error('name', error.msg.NAME_DUPE));
				}
				mongo.findUserByEmail(form.email, function (err, user) {
					if (err) return next(err);
					if (user) {
						return next(error('email', error.msg.EMAIL_DUPE));
					}
					var now = new Date();
					user = {
						_id: mongo.getNewUserId(),
						name: form.name,
						email: form.email,
						hash: bcrypt.hashSync(form.password, 10),
						status: 'v',
						cdate: now,
						adate: now,
						pdate: null,
						profile: form.profile
					};
					if (form.admin) {
						user.admin = true;
					}
					mongo.insertUser(user, function (err) {
						if (err) return next(err);
						next(null, user);
					});
				});
			});
		});
	};

	function checkForm(form, checkpw, next) {
		var errors = new error.Errors();
		if (!form.name.length) {
			errors.add('name', error.msg.NAME_EMPTY);
		} else if (form.name.length > 32 || form.name.length < 2) {
			errors.add('name', error.msg.NAME_RANGE);
		}
		if (!form.email.length) {
			errors.add('email', error.msg.EMAIL_EMPTY);
		} else if (form.email.length > 64 || form.email.length < 8) {
			errors.add('email', error.msg.EMAIL_RANGE);
		} else if (!emailRe.test(form.email)) {
			errors.add('email', error.msg.EMAIL_PATTERN);
		}
		if (checkpw) {
			if (!form.password.length) {
				errors.add('password', error.msg.PASSWORD_EMPTY);
			} else if (form.password.length > 32 || form.password.length < 4) {
				errors.add('password', error.msg.PASSWORD_RANGE);
			}
		}
		if (errors.hasErrors()) {
			return next(error(errors));
		}
		next();
	}

	exports.findCachedUserByEmail = function (email, password, next) {
		mongo.findUserByEmail(email, function (err, user) {
			if (err) return next(err);
			if (!user || !bcrypt.compareSync(password, user.hash)) {
				return next();
			}
			users[user._id] = user;
			next(null, user);
		});
	};

	exports.findCachedUser = function (id, next) {
		var user = users[id];
		if (user) {
			return next(null, user);
		}
		mongo.findUser(id, function (err, user) {
			if (err) return next(err);
			if (!user) return next(error(error.USER_NOT_FOUND));
			users[user._id] = user;
			next(null, user);
		});
	};

	exports.updateUser = function (id, user, form, next) {
		if (user._id != id && !user.admin) {
			return next(error(error.NOT_AUTHORIZED))
		}
		// TODO
		exports.findCachedUser(id, function (err, cuser) {
			if (err) return next(err);
			mongo.updateUserStatus(id, 'd', function (err) {
				if (err) return next(err);
				cuser.status = 'd';
			});
		});
	};

	exports.delUser = function (id, user, next) {
		if (user._id != id && !user.admin) {
			return next(error(error.NOT_AUTHORIZED))
		}
		exports.findCachedUser(id, function (err, cuser) {
			if (err) return next(err);
			mongo.updateUserStatus(id, 'd', function (err) {
				if (err) return next(err);
				cuser.status = 'd';
			});
		});
	};

	next();

});