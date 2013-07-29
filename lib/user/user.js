var bcrypt = require('bcrypt');
var crypto = require('crypto');

var lang = require('../lang/lang');
var init = require('../lang/init');
var config = require('../config/config');
var mongo = require('../mongo/mongo');
var mailer = require('../mail/mailer');
var error = require('../error/error');
var ecode = require('../error/ecode');

// TODO: mongo

init.add(function (next) {

	var resets;

	exports.insertReset = function (reset, next) {
		resets.insert(reset, next);
	};

	exports.delReset = function (email, next) {
		resets.remove({ email: email }, next);
	}

	exports.findReset = function (id, next) {
		resets.findOne({ _id: id }, next);
	};

	resets = exports.resets = exports.db.collection("resets");
	resets.ensureIndex({ email: 1 }, function (err) {
		if (err) return next(err);
		next();
	});

});

// TODO: mongo


init.add(function (next) {

	var users;
	var userIdSeed;

	exports.getNewUserId = function () {
		return ++userIdSeed;
	};

	exports.insertUser = function (user, next) {
		users.insert(user, next);
	};

	exports.findUser = function (id, next) {
		users.findOne({ _id: id }, next);
	};

	exports.findUserByName = function (name, next) {
		users.findOne({ name: name }, next);
	};

	exports.findUserByHome = function (home, next) {
		users.findOne({ home: home }, next);
	};

	exports.findUserByEmail = function (email, next) {
		users.findOne({ email: email }, next);
	};

	exports.countUsersByName = function (name, exid, next) {
		var q = { $or: [
			{ name: name, _id : { $ne: exid } },
			{ home: name, _id : { $ne: exid } }
		]};
		users.count(q, next);
	};

	exports.countUsersByHome = function (name, exid, next) {
		// countUserByName 과 평션정의가 같은 것은 의도된 것
		var q = { $or: [
			{ name: name, _id : { $ne: exid } },
			{ home: name, _id : { $ne: exid } }
		]};
		users.count(q, next);
	};

	exports.countUsersByEmail = function (email, exid, next) {
		users.count({ email: email, _id: { $ne: exid } }, next);
	};

	exports.updateUserAdate = function (id, now, next) {
		users.update({ _id: id }, { $set: { adate: now } }, next);
	};

	exports.updateUserStatus = function (id, status, next) {
		users.update({ _id: id }, { $set: { status: status } }, next);
	};

	exports.updateUser = function (id, fields, next) {
		users.update({ _id: id }, { $set: fields}, next);
	};

	exports.updateUserHash = function (email, hash, excludeAdmin, next) {
		var query = { email: email };
		if (excludeAdmin) {
			query.admin = { $exists: false };
		}
		users.update(query, { $set: { hash: hash } }, next)
	}

	users = exports.users = exports.db.collection("users");
	users.ensureIndex({ email: 1 }, function (err) {
		if (err) return next(err);
		users.ensureIndex({ name: 1 }, function (err) {
			if (err) return next(err);
			users.ensureIndex({ home: 1 }, function (err) {
				if (err) return next(err);
				var opt = {
					fields: { _id: 1 },
					sort: { _id: -1 },
					limit: 1
				}
				users.find({}, opt).nextObject(function (err, obj) {
					if (err) return next(err);
					userIdSeed = obj ? obj._id : 0;
					console.log('mongo: user id seed = ' + userIdSeed);
					next();
				});
			});
		});
	});

});

init.add(function (next) {

	var users = [];
	var usersByHome = {};

	function deleteCache(id) {
		var user = users[id];
		if (user) {
			delete users[id];
			delete usersByHome[user.home];
		}
	}

	function addCache(user) {
		users[user._id] = user;
		usersByHome[user.home] = user;
	}

	exports.makeForm = function (req) {
		var form = {};
		form.name = String(req.body.name || '').trim();
		form.home = String(req.body.home || '').trim();
		form.email = String(req.body.email || '').trim();
		form.password = String(req.body.password || '').trim();
		form.profile = String(req.body.profile || '').trim();
		return form;
	}

	exports.createUser = function (form, next) {
		form.home = form.name;
		checkForm(form, 0, function (err) {
			if (err) return next(err);
			var now = new Date();
			var user = {
				_id: mongo.getNewUserId(),
				name: form.name,
				home: form.home,
				email: form.email,
				hash: makeHash(form.password),
				status: 'v',
				cdate: now,
				adate: now,
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
	};

	exports.updateUser = function (id, user, form, next) {
		checkUpdatable(id, user, function (err) {
			if (err) return next(err);
			checkForm(form, id, function (err) {
				if (err) return next(err);
				var fields = {
					name: form.name,
					home: form.home,
					email: form.email,
					profile: form.profile
				};
				if (form.password.length > 0) {
					fields.hash = makeHash(form.password);
				}
				mongo.updateUser(id, fields, function (err, cnt) {
					if (err) return next(err);
					if (!cnt) {
						return next(error(ecode.USER_NOT_FOUND));
					}
					deleteCache(id);
					next();
				});
			});
		});
	};

	exports.deactivateUser = function (id, user, next) {
		checkUpdatable(id, user, function (err) {
			if (err) return next(err);
			mongo.updateUserStatus(id, 'd', function (err, cnt) {
				if (err) return next(err);
				if (!cnt) {
					return next(error(ecode.USER_NOT_FOUND));
				}
				deleteCache(id);
				next();
			});
		});
	};

	function checkForm(form, id, next) {
		var errors = [];
		var creating = !id;

		if (!form.name.length) {
			errors.push(ecode.NAME_EMPTY);
		} else if (form.name.length > 32 || form.name.length < 2) {
			errors.push(ecode.NAME_RANGE);
		}

		if (!form.home.length) {
			errors.push(ecode.HOME_EMPTY);
		} else if (form.home.length > 32 || form.home.length < 2) {
			errors.push(ecode.HOME_RANGE);
		}

		checkFormEmail(form, errors);

		if (creating || form.password.length) {
			checkFormPassword(form, errors);
		}

		mongo.countUsersByName(form.name, id, function (err, cnt) {
			if (err) return next(err);
			if (cnt) {
				errors.push(ecode.NAME_DUPE);
			}
			mongo.countUsersByHome(form.home, id, function (err, cnt) {
				if (err) return next(err);
				if (cnt) {
					errors.push(ecode.HOME_DUPE);
				}
				mongo.countUsersByEmail(form.email, id, function (err, cnt) {
					if (err) return next(err);
					if (cnt) {
						errors.push(ecode.EMAIL_DUPE);
					}
					if (errors.length) {
						return next(error(errors));
					}
					next();
				});
			});
		});
	}

	function checkFormEmail(form, errors) {
		if (!form.email.length) {
			errors.push(ecode.EMAIL_EMPTY);
		} else if (form.email.length > 64 || form.email.length < 8) {
			errors.push(ecode.EMAIL_RANGE);
		} else if (!lang.emailX.test(form.email)) {
			errors.push(ecode.EMAIL_PATTERN);
		}
	}

	function checkFormPassword(form, errors) {
		if (!form.password.length) {
			errors.push(ecode.PASSWORD_EMPTY);
		} else if (form.password.length > 32 || form.password.length < 4) {
			errors.push(ecode.PASSWORD_RANGE);
		}
	}

	function checkUpdatable(id, user, next) {
		if (user._id != id && !user.admin) {
			return next(error(ecode.NOT_AUTHORIZED))
		}
		next();
	}

	function makeHash(password) {
		return bcrypt.hashSync(password, 10);
	}

	exports.validatePassword = function (password, hash) {
		return bcrypt.compareSync(password, hash);
	}

	exports.findCachedUser = function (id, next) {
		var user = users[id];
		if (user) {
			return next(null, user);
		}
		mongo.findUser(id, function (err, user) {
			if (err) return next(err);
			if (!user) return next(error(ecode.USER_NOT_FOUND));
			addCache(user);
			next(null, user);
		});
	};

	exports.findCachedUserByHome = function (home, next) {
		var user = usersByHome[home];
		if (user) {
			return next(null, user);
		}
		mongo.findUserByHome(home, function (err, user) {
			if (err) return next(err);
			if (!user) {
				// 사용자 프로필 URL 검색에 주로 사용되므로 error 생성은 패스한다.
				return next();
			}
			addCache(user);
			next(null, user);
		});
	};

	exports.findUserByEmailAndCache = function (email, next) {
		mongo.findUserByEmail(email, function (err, user) {
			if (err) return next(err);
			if (!user) {
				return next();
			}
			addCache(user);
			next(null, user);
		});
	};

	exports.findUserForView = function (user, id, next) {
		exports.findCachedUser(id, function (err, _tuser) {
			if (err) return next(err);
			var tuesr;
			if (user && user.admin) {
				tuesr = {
					_id: _tuser._id,
					name: _tuser.name,
					home: _tuser.home,
					email: _tuser.email,
					status: _tuser.status,
					cdate: _tuser.cdate.getTime(),
					adate: _tuser.adate.getTime(),
					profile: _tuser.profile
				};
			} else if (user && user._id == _tuser._id) {
				tuesr = {
					_id: _tuser._id,
					name: _tuser.name,
					home: _tuser.home,
					email: _tuser.email,
					status: _tuser.status,
					cdate: _tuser.cdate.getTime(),
					adate: _tuser.adate.getTime(),
					profile: _tuser.profile
				};
			} else {
				tuesr = {
					_id: _tuser._id,
					name: _tuser.name,
					home: _tuser.home,
					//email: _tuser.email,
					status: _tuser.status,
					cdate: _tuser.cdate.getTime(),
					//adate: _tuser.adate.getTime(),
					profile: _tuser.profile
				};
			}
			next(null, tuesr);
		});
	}

	exports.findUserForUpdate = function (id, user, next) {
		checkUpdatable(id, user, function (err) {
			if (err) return next(err);
			exports.findCachedUser(id, function (err, _tuser) {
				if (err) return next(err);
				next(null, {
					_id: _tuser._id,
					name: _tuser.name,
					home: _tuser.home,
					email: _tuser.email,
					profile: _tuser.profile
				});
			});
		});
	};

	exports.countUsers = function (next) {
		mongo.users.count(next);
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
		crypto.randomBytes(12, function(err, buf) {
			if (err) return next(err);
			var token = buf.toString('hex');
			mongo.findUserByEmail(form.email, function (err, user) {
				if (err) return next(err);
				if (!user) {
					return next(error(ecode.EMAIL_NOT_EXIST));
				}
				mongo.delReset(form.email, function (err) {
					if (err) return next(err);
					var reset = {
						email: form.email,
						token: token
					};
					mongo.insertReset(reset, function (err, resets) {
						if (err) return next(err);
						var reset = resets[0];
						var mail = {
							from: 'no-reply@raysoda.com',
							to: reset.email,
							subject: 'Reset Password - ' + config.data.appName,
							text:
								'\n' +
								'Open the following URL to reset password.\n\n' +
								config.data.frontUrl + '/users/reset?id=' + reset._id + '&t=' + reset.token + '\n\n' +
								config.data.appName
						};
						mailer.send(mail, next);
					});
				});
			});
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
		mongo.findReset(new mongo.ObjectID(form._id), function (err, reset) {
			if (err) return next(err);
			if (!reset) {
				return next(error(ecode.INVALID_DATA));
			}
			if (form.token != reset.token) {
				return next(error(ecode.INVALID_DATA));
			}
			if (Date.now() - reset._id.getTimestamp().getTime() > 15 * 60 * 1000) {
				return next(error(ecode.RESET_TIMEOUT));
			}
			mongo.updateUserHash(reset.email, makeHash(form.password), true, function (err) {
				if (err) return next(err);
				mongo.delReset(form.email, next);
				// user cache 를 찾아 지울 필요는 없다.
				// 세션 생성시 cache 에는 새로운 user 오브젝트가 대입;
			});
		});
	};

	next();

});