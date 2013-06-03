var bcrypt = require('bcrypt');

var init = require('../main/init');
var mongo = require('../main/mongo');
var mailer = require('../main/mailer');
var error = require('../main/error');
var ecode = require('../main/ecode');

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

	var emailRe = /^[a-z0-9-_+]+@[a-z0-9-]+(\.[a-z0-9-]+)+$/i

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
							return next(error(ecode.USER_NOT_FOUND));
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
					return next(error(ecode.USER_NOT_FOUND));
				}
				delete users[id];
				next();
			});
		});
	};

	function checkForm(form, next) {
		var errors = [];
		checkFormName(form, errors);
		checkFormEmail(form, errors);
		checkFormPassword(form, errors);
		if (errors.length) {
			return next(error(errors));
		}
		next();
	}

	function checkFormForUpdate(form, next) {
		var errors = [];
		checkFormName(form, errors);
		checkFormEmail(form, errors);
		if (form.password.length) {
			checkFormPassword(form, errors);
		}
		if (errors.length) {
			return next(error(errors));
		}
		next();
	}

	function checkFormName(form, errors) {
		if (!form.name.length) {
			errors.push(ecode.fields.NAME_EMPTY);
		} else if (form.name.length > 32 || form.name.length < 2) {
			errors.push(ecode.fields.NAME_RANGE);
		}

	}

	function checkFormEmail(form, errors) {
		if (!form.email.length) {
			errors.push(ecode.fields.EMAIL_EMPTY);
		} else if (form.email.length > 64 || form.email.length < 8) {
			errors.push(ecode.fields.EMAIL_RANGE);
		} else if (!emailRe.test(form.email)) {
			errors.push(ecode.fields.EMAIL_PATTERN);
		}

	}

	function checkFormPassword(form, errors) {
		if (!form.password.length) {
			errors.push(ecode.fields.PASSWORD_EMPTY);
		} else if (form.password.length > 32 || form.password.length < 4) {
			errors.push(ecode.fields.PASSWORD_RANGE);
		}

	}

	function checkDupe(form, next) {
		mongo.findUserByName(form.name, function (err, user) {
			if (err) return next(err);
			if (user) {
				return next(error(ecode.fields.NAME_DUPE));
			}
			mongo.findUserByEmail(form.email, function (err, user) {
				if (err) return next(err);
				if (user) {
					return next(error(ecode.fields.EMAIL_DUPE));
				}
				next();
			});
		});
	}

	function checkDupeForUpdate(form, id, next) {
		mongo.findUserByName(form.name, function (err, user) {
			if (err) return next(err);
			if (user && user._id != id) {
				return next(error(ecode.fields.NAME_DUPE));
			}
			mongo.findUserByEmail(form.email, function (err, user) {
				if (err) return next(err);
				if (user && user._id != id) {
					return next(error(ecode.fields.EMAIL_DUPE));
				}
				next();
			});
		});
	}

	function checkUpdateAuth(id, user, next) {
		if (user._id != id && !user.admin) {
			return next(error(ecode.NOT_AUTHORIZED))
		}
		next();
	}

	exports.findCachedUserByEmail = function (email, password, next) {
		mongo.findUserByEmail(email, function (err, user) {
			if (err) return next(err);
			if (!user || !bcrypt.compareSync(password, user.hash)) {
				return next(error(ecode.fields.USER_NOT_FOUND));
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
			if (!user) return next(error(ecode.USER_NOT_FOUND));
			users[user._id] = user;
			next(null, user);
		});
	};

	exports.findUserForView = function (id, user, next) {
		exports.findCachedUser(id, function (err, _tuser) {
			if (err) return next(err);
			var tuesr;
			if (user && user.admin) {
				tuesr = {
					_id: _tuser._id,
					name: _tuser.name,
					email: _tuser.email,
					status: _tuser.status,
					cdate: _tuser.cdate.getTime(),
					adate: _tuser.adate.getTime(),
					profile: _tuser.profile,
					footer: _tuser.footer
				};
			} else if (user && user._id == _tuser._id) {
				tuesr = {
					_id: _tuser._id,
					name: _tuser.name,
					email: _tuser.email,
					status: _tuser.status,
					cdate: _tuser.cdate.getTime(),
					adate: _tuser.adate.getTime(),
					profile: _tuser.profile,
					footer: _tuser.footer
				};
			} else {
				tuesr = {
					_id: _tuser._id,
					name: _tuser.name,
					//email: _tuser.email,
					status: _tuser.status,
					cdate: _tuser.cdate.getTime(),
					//adate: _tuser.adate.getTime(),
					profile: _tuser.profile,
					footer: _tuser.footer
				};
			}
			next(null, tuesr);
		});
	}

	exports.findUserForEdit = function (id, user, next) {
		checkUpdateAuth(id, user, function (err) {
			if (err) return next(err);
			exports.findCachedUser(id, function (err, _tuser) {
				if (err) return next(err);
				next(null, {
					_id: _tuser._id,
					name: _tuser.name,
					email: _tuser.email,
					profile: _tuser.profile,
					footer: _tuser.footer
				});
			});
		});
	};

	exports.makeResetReqForm = function (req) {
		var form = {};
		form.email = String(req.body.email || '').trim();
		return form;
	}

	exports.createResetReq = function (form, next) {
		var errors = [];
		checkFormEmail(form, errors);
		if (errors.length) {
			return next(error(errors));
		}
		mongo.insertReset(form.email, function (err, resets) {
			if (err) return next(err);
			var reset = resets[0];
			mailer.send({
				from: 'no-reply@raysoda.com',
				to: reset.email,
				subject: 'Reset Password - ' + config.data.appName,
				text:
					'\n' +
					'Open folling url on browser to reset password.\n\n' +
					config.data.appUrl + '/users/reset?id=' + reset._id + '&t=' + reset.token + '\n\n' +
					config.data.appName
			}, next);
		});
	};

	exports.makeResetForm = function (req) {
		var form = {};
		form._id = String(req.body._id || '').trim();
		form.token = String(req.body.token || '').trim();
		form.password = String(req.body.password || '').trim();
		return form;
	}

	exports.reset = function (form, next) {
		var errors = [];
		checkFormPassword(form, errors);
		if (errors.length) {
			return next(error(errors));
		}
		mongo.findReset(form._id, function (err, reset) {
			if (err) return next(err);
			if (!reset) {
				return next(error(ecode.INVALID_DATA));
			}
			// TODO
		});
	};

	next();

});