var bcrypt = require('bcrypt');
var crypto = require('crypto');

var init = require('../lang/init');
var mongo = require('../mongo/mongo');
var u = require('../user/user');
var express = require('../express/express');
var error = require('../error/error');
var ecode = require('../error/ecode');

var seed;

init.add(function (next) {
	var opt = {
		fields: { _id: 1 },
		sort: { _id: -1 },
		limit: 1
	}
	mongo.users.find({}, opt).nextObject(function (err, obj) {
		if (err) return next(err);
		seed = obj ? obj._id : 0;
		console.log('user-create: seed = ' + seed);
		next();
	});
});

init.add(function (next) {
	app.post('/api/users', function (req, res) {
		var form = exports.makeForm(req);
		exports.createUser(form, function (err, user) {
			if (err) return res.jsonErr(err);
			res.json({
				id: user._id
			});
		});
	});

	app.get('/users/register', function (req, res) {
		res.render('user-create');
	});

	next();
});

exports.getNewUserId = function () {
	return ++seed;
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
	// form.namel = form.name.toLowerCase();
	// form.homel = form.home.toLowerCase();
	exports.checkForm(form, 0, function (err) {
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
		// can't be set through form.
		if (form.admin) {
			user.admin = true;
		}
		mongo.users.insert(user, function (err) {
			if (err) return next(err);
			next(null, user);
		});
	});
};

exports.checkForm = function (form, id, next) {
	var errors = [];
	var creating = id == 0;

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

	exports.checkFormEmail(form, errors);

	if (creating || form.password.length) {
		exports.checkFormPassword(form, errors);
	}

	countUsersByName(form.name, id, function (err, cnt) {
		if (err) return next(err);
		if (cnt) {
			errors.push(ecode.NAME_DUPE);
		}
		countUsersByHome(form.home, id, function (err, cnt) {
			if (err) return next(err);
			if (cnt) {
				errors.push(ecode.HOME_DUPE);
			}
			countUsersByEmail(form.email, id, function (err, cnt) {
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

exports.checkFormEmail = function (form, errors) {
	if (!form.email.length) {
		errors.push(ecode.EMAIL_EMPTY);
	} else if (form.email.length > 64 || form.email.length < 8) {
		errors.push(ecode.EMAIL_RANGE);
	} else if (!lang.emailX.test(form.email)) {
		errors.push(ecode.EMAIL_PATTERN);
	}
}

exports.checkFormPassword = function (form, errors) {
	if (!form.password.length) {
		errors.push(ecode.PASSWORD_EMPTY);
	} else if (form.password.length > 32 || form.password.length < 4) {
		errors.push(ecode.PASSWORD_RANGE);
	}
}

exports.makeHash = function (password) {
	return bcrypt.hashSync(password, 10);
}

function countUsersByName(name, id, next) {
	var q = { $or: [
		{ name: name, _id : { $ne: id } },
		{ home: name, _id : { $ne: id } }
	]};
	mongo.users.count(q, next);
};

functino countUsersByHome(name, id, next) {
	// countUserByName 과 평션정의가 같은 것은 의도된 것
	var q = { $or: [
		{ name: name, _id : { $ne: id } },
		{ home: name, _id : { $ne: id } }
	]};
	mongo.users.count(q, next);
};

function countUsersByEmail(email, id, next) {
	var q = { 
		email: email, _id: { $ne: id } 
	};
	mongo.users.count(q, next);
};
