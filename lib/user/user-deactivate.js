var init = require('../lang/init');
var mongo = require('../mongo/mongo');
var userb = require('../user/user-base');
var usera = require('../user/user-auth');
var useru = require('../user/user-update');
var express = require('../express/express');
var error = require('../error/error');
var ecode = require('../error/ecode');

init.add(function () {
	var app = express.app;

	app.del('/api/users/:id([0-9]+)', function (req, res) {
		usera.getUser(res, function (err, user) {
			if (err) return express.jsonErr(res, err);
			var id = parseInt(req.params.id) || 0;
			deactivateUser(id, user, function (err) {
				if (err) return express.jsonErr(res, err);
				usera.deleteSession(req, res);
				res.json({});
			});
		});
	});

	app.get('/users/deactivate', function (req, res) {
		usera.getUser(res, function (err, user) {
			if (err) return express.renderErr(res, err);
			res.render('user-deactivate');
		});
	});
});

function deactivateUser(id, user, next) {
	useru.checkUpdatable(id, user, function (err) {
		if (err) return next(err);
		mongo.users.update({ _id: id }, { $set: { status: 'd' } }, function (err, cnt) {
			if (err) return next(err);
			if (!cnt) {
				return next(error(ecode.USER_NOT_FOUND));
			}
			userb.deleteCache(id);
			next();
		});
	});
};
