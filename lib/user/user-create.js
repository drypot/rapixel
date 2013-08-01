var init = require('../lang/init');
var mongo = require('../mongo/mongo');
var express = require('../express/express');
var userb = require('../user/user-base');
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

init.add(function () {
	var app = express.app;

	app.post('/api/users', function (req, res) {
		var form = exports.getForm(req.body);
		exports.createUser(form, function (err, user) {
			if (err) return express.jsonErr(res, err);
			res.json({
				id: user._id
			});
		});
	});

	app.get('/users/register', function (req, res) {
		res.render('user-create');
	});
});

exports.getNewUserId = function () {
	return ++seed;
};

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
			hash: userb.makeHash(form.password),
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

	checkFormEmail(form, errors);

	if (creating || form.password.length) {
		checkFormPassword(form, errors);
	}

	countUsersByName(form.namel, id, function (err, cnt) {
		if (err) return next(err);
		if (cnt) {
			errors.push(ecode.NAME_DUPE);
		}
		countUsersByHome(form.homel, id, function (err, cnt) {
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
		errors.push(ecode.EMAIL_EMPTY);
	} else if (form.email.length > 64 || form.email.length < 8) {
		errors.push(ecode.EMAIL_RANGE);
	} else if (!userb.emailx.test(form.email)) {
		errors.push(ecode.EMAIL_PATTERN);
	}
}

var checkFormPassword = exports.checkFormPassword = function (form, errors) {
	if (!form.password.length) {
		errors.push(ecode.PASSWORD_EMPTY);
	} else if (form.password.length > 32 || form.password.length < 4) {
		errors.push(ecode.PASSWORD_RANGE);
	}
}



