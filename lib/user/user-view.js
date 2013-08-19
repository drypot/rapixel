var init = require('../lang/init');
var error = require('../error/error');
var mongo = require('../mongo/mongo');
var express = require('../express/express');

init.add(function () {
	var app = express.app;

	app.get('/api/users/:id([0-9]+)', function (req, res) {
		var id = parseInt(req.params.id) || 0;
		var user = res.locals.user
		exports.getCached(id, function (err, _tuser) {
			if (err) return res.jsonErr(err);
			var tuser;
			if (user && user.admin) {
				tuser = {
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
				tuser = {
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
				tuser = {
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
			res.json({
				user: tuser
			});
		});
	});
});

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
		if (!user) return next(error(error.ids.USER_NOT_FOUND));
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
