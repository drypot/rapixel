var init = require('../lang/init');
var error = require('../error/error');
var config = require('../config/config');
var mongo = require('../mongo/mongo');
var express = require('../express/express');
var userc = require('../user/user-create');

init.add(function () {
	var app = express.app;

	app.get('/users', function (req, res) {
		mongo.users.count(function (err, count) {
			if (err) return res.renderErr(err);
			res.render('user-list', { count: count });
		});
	});
});
