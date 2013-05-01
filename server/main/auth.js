var bcrypt = require('bcrypt');

var init = require('../main/init');
var config = require('../main/config');

init.add(function () {

	var roles = {};

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

});
