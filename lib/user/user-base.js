var bcrypt = require('bcrypt');
var crypto = require('crypto');

var init = require('../lang/init');
var mongo = require('../mongo/mongo');
var error = require('../error/error');
var ecode = require('../error/ecode');

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

var emailx = exports.emailx = /^[a-z0-9-_+.]+@[a-z0-9-]+(\.[a-z0-9-]+)+$/i

exports.makeHash = function (password) {
	return bcrypt.hashSync(password, 10);
}

exports.checkPassword = function (password, hash) {
	return bcrypt.compareSync(password, hash);
}

var users = [];
var usersByHome = {};

function cache(user) {
	users[user._id] = user;
	usersByHome[user.homel] = user;
}

exports.deleteCache = function (id) {
	var user = users[id];
	if (user) {
		delete users[id];
		delete usersByHome[user.homel];
	}
}

exports.getCached = function (id, next) {
	var user = users[id];
	if (user) {
		return next(null, user);
	}
	mongo.users.findOne({ _id: id }, function (err, user) {
		if (err) return next(err);
		if (!user) return next(error(ecode.USER_NOT_FOUND));
		cache(user);
		next(null, user);
	});
};

exports.getCachedByHome = function (homel, next) {
	var user = usersByHome[homel];
	if (user) {
		return next(null, user);
	}
	mongo.users.findOne({ homel: homel }, function (err, user) {
		if (err) return next(err);
		if (!user) {
			// 사용자 프로필 URL 검색에 주로 사용되므로 error 생성은 패스한다.
			return next();
		}
		cache(user);
		next(null, user);
	});
};

exports.findAndCache = function (email, next) {
	mongo.users.findOne({ email: email }, function (err, user) {
		if (err) return next(err);
		if (!user) {
			return next();
		}
		cache(user);
		next(null, user);
	});
};
