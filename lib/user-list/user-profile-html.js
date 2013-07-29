var init = require('../lang/init');
var express = require('../express/express');
var userl = require('../user/user');
var userHtml = require('../user/user-html');

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