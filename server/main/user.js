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
		form.footer = String(req.body.footer || '').trim();
		return form;
	}

	var emailRe = /^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)+$/i

	exports.createUser = function (form, next) {
		checkForm(form, function (err) {
			if (err) return next(err);
			checkDupe(form, function (err) {
				if (err) return next(err);
				var now = new Date();
				var user = {
					_id: mongo.getNewUserId(),
					name: form.name,
					email: form.email,
					hash: bcrypt.hashSync(form.password, 10),
					status: 'v',
					cdate: now,
					adate: now,
					pdate: null,
					profile: form.profile,
					footer: form.footer
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
	};

	exports.updateUser = function (id, user, form, next) {
		checkUpdateAuth(id, user, function (err) {
			if (err) return next(err);
			checkFormForUpdate(form, function (err) {
				if (err) return next(err);
				checkDupeForUpdate(form, id, function (err) {
					if (err) return next(err);
					var fields = {
						name: form.name,
						email: form.email,
						profile: form.profile,
						footer: form.footer
					};
					if (form.password.length > 0) {
						fields.hash = bcrypt.hashSync(form.password, 10);
					}
					mongo.updateUser(id, fields, function (err, cnt) {
						if (err) return next(err);
						if (!cnt) {
							return next(error.USER_NOT_FOUND);
						}
						delete users[id];
						next();
					});
				});
			});
		});
	};

	exports.delUser = function (id, user, next) {
		checkUpdateAuth(id, user, function (err) {
			if (err) return next(err);
			mongo.updateUserStatus(id, 'd', function (err, cnt) {
				if (err) return next(err);
				if (!cnt) {
					return next(error.USER_NOT_FOUND);
				}
				delete users[id];
				next();
			});
		});
	};

	function checkForm(form, next) {
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
		if (!form.password.length) {
			errors.add('password', error.msg.PASSWORD_EMPTY);
		} else if (form.password.length > 32 || form.password.length < 4) {
			errors.add('password', error.msg.PASSWORD_RANGE);
		}
		if (errors.hasErrors()) {
			return next(error(errors));
		}
		next();
	}

	function checkFormForUpdate(form, next) {
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
		if (form.password.length) {
			if (form.password.length > 32 || form.password.length < 4) {
				errors.add('password', error.msg.PASSWORD_RANGE);
			}
		}
		if (errors.hasErrors()) {
			return next(error(errors));
		}
		next();
	}

	function checkDupe(form, next) {
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
				next();
			});
		});
	}

	function checkDupeForUpdate(form, id, next) {
		mongo.findUserByName(form.name, function (err, user) {
			if (err) return next(err);
			if (user && user._id != id) {
				return next(error('name', error.msg.NAME_DUPE));
			}
			mongo.findUserByEmail(form.email, function (err, user) {
				if (err) return next(err);
				if (user && user._id != id) {
					return next(error('email', error.msg.EMAIL_DUPE));
				}
				next();
			});
		});
	}

	function checkUpdateAuth(id, user, next) {
		if (user._id != id && !user.admin) {
			return next(error(error.NOT_AUTHORIZED))
		}
		next();
	}

	exports.findCachedUserByEmail = function (email, password, next) {
		mongo.findUserByEmail(email, function (err, user) {
			if (err) return next(err);
			if (!user || !bcrypt.compareSync(password, user.hash)) {
				return next(error('email', error.msg.USER_NOT_FOUND));
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

	next();

});