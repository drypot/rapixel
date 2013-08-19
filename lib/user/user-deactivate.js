var init = require('../lang/init');
var error = require('../error/error');
var mongo = require('../mongo/mongo');
var userv = require('../user/user-view');
var usera = require('../user/user-auth');
var useru = require('../user/user-update');
var express = require('../express/express');

init.add(function () {
	var app = express.app;

	app.del('/api/users/:id([0-9]+)', function (req, res) {
		usera.getUser(res, function (err, user) {
			if (err) return res.jsonErr(err);
			var id = parseInt(req.params.id) || 0;
			deactivateUser(id, user, function (err) {
				if (err) return res.jsonErr(err);
				usera.deleteSession(req, res);
				res.json({});
			});
		});
	});

	app.get('/users/deactivate', function (req, res) {
		usera.getUser(res, function (err, user) {
			if (err) return res.renderErr(err);
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
				return next(error(error.ids.USER_NOT_FOUND));
			}
			userv.deleteCache(id);
			next();
		});
	});
};
