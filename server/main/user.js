var bcrypt = require('bcrypt');

var init = require('../main/init');
var mongo = require('../main/mongo');
var error = require('../main/error');

init.add(function (next) {

	var users = [];

	exports.createUser = function (form, next) {
		checkForm(form, function (err) {
			if (err) return next(err);
			mongo.findUserByName(form.name, function (err, u) {
				if (err) return next(err);
				if (u) {
					return next(error({
						rc: error.INVALID_DATA,
						fields: [{ name: 'name', msg: error.msg.NAME_DUPE }]
					}));
				}
				mongo.findUserByEmail(form.email, function (err, user) {
					if (err) return next(err);
					if (user) {
						return next(error({
							rc: error.INVALID_DATA,
							fields: [{ name: 'email', msg: error.msg.EMAIL_DUPE }]
						}));
					}
					var now = new Date();
					user = {
						_id: mongo.newUserId(),
						name: form.name,
						email: form.email,
						hash: bcrypt.hashSync(form.password, 10),
						status: 'v',
						cdate: now,
						adate: now,
						pdate: null,
						profile: ''
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

	var emailPattern = /^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)+$/i

	function checkForm(form, next) {
		var fields = [];

		if (!form.name.length) {
			fields.push({ name: 'name', msg: error.msg.NAME_EMPTY });
		} else if (form.name.length > 32 || form.name.length < 2) {
			fields.push({ name: 'name', msg: error.msg.NAME_RANGE });
		}
		if (!form.email.length) {
			fields.push({ name: 'email', msg: error.msg.EMAIL_EMPTY });
		} else if (form.email.length > 64 || form.email.length < 8) {
			fields.push({ name: 'email', msg: error.msg.EMAIL_RANGE });
		} else if (!emailPattern.test(form.email)) {
			fields.push({ name: 'email', msg: error.msg.EMAIL_PATTERN });
		}
		if (!form.password.length) {
			fields.push({ name: 'password', msg: error.msg.PASSWORD_EMPTY });
		} else if (form.password.length > 32 || form.password.length < 4) {
			fields.push({ name: 'password', msg: error.msg.PASSWORD_RANGE });
		}
		if (fields.length) {
			return next(error({ rc: error.INVALID_DATA, fields: fields }));
		}
		next();
	}

	exports.findCachedUserByEmail = function (email, password, next) {
		mongo.findUserByEmail(email, function (err, user) {
			if (err) return next(err);
			if (!user || !bcrypt.compareSync(password, user.hash)) {
				return next(error(error.INVALID_PASSWORD));
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
			users[user._id] = user;
			next(null, user);
		});
	};

	next();

});