var bcrypt = require('bcrypt');

var init = require('../main/init');
var config = require('../main/config');
var mongo = require('../main/mongo');

init.add(function () {

	var roles = {};
	var users = [];

	config.data.roles.forEach(function (_role) {
		var role = {
			name: _role.name
		};
		roles[role.name] = role;
	});
	console.log('auth:');

	exports.roleByName = function (roleName) {
		return roles[roleName];
	};

	exports.cacheUser = function (user) {
		users[user._id] = user;
	};

	exports.user = function (id, next) {
		var user = users[id];
		if (user) return next(null, user);
		mongo.findUser(id, function (err, user) {
			if (err) return next(err);
			users[id] = user;
			next(null, user);
		});
	};
});
