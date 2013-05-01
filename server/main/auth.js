var bcrypt = require('bcrypt');

var init = require('../main/init');
var config = require('../main/config');

init.add(function () {

	var roles = {};

	config.data.roles.forEach(function (_role) {
		var role = {
			name: _role.name,
			hash: _role.hash,
			categories: {},
			categoriesForMenu : [],
			categoriesForNew : []
		};
		config.data.categories.forEach(function (_category) {
			var category = {
				id: _category.id,
				name: _category.name,
				sep: _category.sep,
				readable: _category.read.indexOf(role.name) != -1,
				writable: _category.write.indexOf(role.name) != -1,
				editable: _category.edit.indexOf(role.name) != -1
			};
			if (category.readable) {
				role.categories[category.id] = category;
				role.categoriesForMenu.push(category);
			}
			if (category.writable) {
				role.categoriesForNew.push(category);
			}
		});
		roles[role.name] = role;
	});
	console.log('auth:');

	exports.roleByName = function (roleName) {
		return roles[roleName];
	};

	exports.roleByPassword = function (password) {
		for (var roleName in roles) {
			var role = roles[roleName];
			if (bcrypt.compareSync(password, role.hash)) {
				return role;
			}
		}
		return null;
	};

});
