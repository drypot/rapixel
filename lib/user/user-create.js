var bcrypt = require('bcrypt');
var crypto = require('crypto');

var init = require('../lang/init');
var error = require('../error/error');
var mongo = require('../mongo/mongo');
var express = require('../express/express');
var userb = require('../user/user-base');

var seed;

init.add(function (next) {
	var users = mongo.users = mongo.db.collection("users");

	users.ensureIndex({ email: 1 }, function (err) {
		if (err) return next(err);
		users.ensureIndex({ namel: 1 }, function (err) {
			if (err) return next(err);
			users.ensureIndex({ homel: 1 }, next);
		});
	});
});

init.add(function (next) {
	var opt = {
		fields: { _id: 1 },
		sort: { _id: -1 },
		limit: 1
	}
	mongo.users.find({}, opt).nextObject(function (err, obj) {
		if (err) return next(err);
		seed = obj ? obj._id : 0;
		console.log('user-create: id seed = ' + seed);
		next();
	});
});

init.add(function () {
	var app = express.app;

	app.post('/api/users', function (req, res) {
		var form = exports.getForm(req.body);
		exports.createUser(form, function (err, user) {
			if (err) return res.jsonErr(err);
			res.json({
				id: user._id
			});
		});
	});

	app.get('/users/register', function (req, res) {
		res.render('user/user-create');
	});
});

var emailx = exports.emailx = /^[a-z0-9-_+.]+@[a-z0-9-]+(\.[a-z0-9-]+)+$/i

exports.getNewUserId = function () {
	return ++seed;
};

exports.makeHash = function (password) {
	return bcrypt.hashSync(password, 10);
}

exports.checkPassword = function (password, hash) {
	return bcrypt.compareSync(password, hash);
}

exports.getForm = function (body) {
	var form = {};
	form.name = String(body.name || '').trim();
	form.home = String(body.home || '').trim();
	form.email = String(body.email || '').trim();
	form.password = String(body.password || '').trim();
	form.profile = String(body.profile || '').trim();
	return form;
}

exports.createUser = function (form, next) {
	form.home = form.name;
	form.homel = form.namel = form.name.toLowerCase();
	exports.checkForm(form, 0, function (err) {
		if (err) return next(err);
		var now = new Date();
		var user = {
			_id: exports.getNewUserId(),
			name: form.name,
			namel: form.namel,
			home: form.home,
			homel: form.homel,
			email: form.email,
			hash: exports.makeHash(form.password),
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
		errors.push(error.NAME_EMPTY);
	} else if (form.name.length > 32 || form.name.length < 2) {
		errors.push(error.NAME_RANGE);
	}

	if (!form.home.length) {
		errors.push(error.HOME_EMPTY);
	} else if (form.home.length > 32 || form.home.length < 2) {
		errors.push(error.HOME_RANGE);
	}

	checkFormEmail(form, errors);

	if (creating || form.password.length) {
		checkFormPassword(form, errors);
	}

	countUsersByName(form.namel, id, function (err, cnt) {
		if (err) return next(err);
		if (cnt) {
			errors.push(error.NAME_DUPE);
		}
		countUsersByHome(form.homel, id, function (err, cnt) {
			if (err) return next(err);
			if (cnt) {
				errors.push(error.HOME_DUPE);
			}
			countUsersByEmail(form.email, id, function (err, cnt) {
				if (err) return next(err);
				if (cnt) {
					errors.push(error.EMAIL_DUPE);
				}
				if (errors.length) {
					return next(error(errors));
				}
				next();
			});
		});
	});
}

function countUsersByName(namel, id, next) {
	var q = { $or: [
		{ namel: namel, _id : { $ne: id } },
		{ homel: namel, _id : { $ne: id } }
	]};
	mongo.users.count(q, next);
};

function countUsersByHome(namel, id, next) {
	// countUserByName 과 평션정의가 같다. 정상이다. 들어오는 인자는 다르다.
	var q = { $or: [
		{ namel: namel, _id : { $ne: id } },
		{ homel: namel, _id : { $ne: id } }
	]};
	mongo.users.count(q, next);
};

function countUsersByEmail(email, id, next) {
	var q = { 
		email: email, _id: { $ne: id } 
	};
	mongo.users.count(q, next);
};

var checkFormEmail = exports.checkFormEmail = function (form, errors) {
	if (!form.email.length) {
		errors.push(error.EMAIL_EMPTY);
	} else if (form.email.length > 64 || form.email.length < 8) {
		errors.push(error.EMAIL_RANGE);
	} else if (!exports.emailx.test(form.email)) {
		errors.push(error.EMAIL_PATTERN);
	}
}

var checkFormPassword = exports.checkFormPassword = function (form, errors) {
	if (!form.password.length) {
		errors.push(error.PASSWORD_EMPTY);
	} else if (form.password.length > 32 || form.password.length < 4) {
		errors.push(error.PASSWORD_RANGE);
	}
}



