var init = require('../main/init');
var express = require('../main/express');
var userl = require('../main/user');
var userHtml = require('../main/user-html');

init.add(function () {

	var app = express.app;

	console.log('users-profile-html:');

	app.get('/:name([^/]+)', function (req, res, next) {
		var name = decodeURIComponent(req.params.name);
		userl.findCachedUserByHome(name, function (err, user) {
			if (user) {
				return userHtml.renderProfile(req, res, user._id);
			}
			next();
		});
	});

});