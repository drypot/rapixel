var bcrypt = require('bcrypt');
var crypto = require('crypto');

	var userIdSeed;

	exports.getNewUserId = function () {
		return ++userIdSeed;
	};



	exports.insertUser = function (user, next) {
		users.insert(user, next);
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


	function makeHash(password) {
		return bcrypt.hashSync(password, 10);
	}

	exports.countUsers = function (next) {
		mongo.users.count(next);
	};
