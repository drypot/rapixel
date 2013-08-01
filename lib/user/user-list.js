var init = require('../lang/init');
var config = require('../config/config');
var mongo = require('../mongo/mongo');
var express = require('../express/express');
var userb = require('../user/user-base');
var error = require('../error/error');
var ecode = require('../error/ecode');

init.add(function () {
	var app = express.app;

	app.get('/users', function (req, res) {
		mongo.users.count(function (err, count) {
			if (err) return res.renderErr(err);
			res.render('user-list', { count: count });
		});
	});
});
