var init = require('../main/init');
var l = require('../main/l');
var dt = require('../main/dt');
var userl = require('../main/user');
var photol = require('../main/photo');
var express = require('../main/express');
var UrlMaker = require('../main/UrlMaker');

init.add(function () {

	var app = express.app;

	console.log('users-html:');

	app.get('/users/:id([0-9]+)', function (req, res) {
		var id = parseInt(req.params.id) || 0;
		exports.renderProfile(req, res, id);
	});

	exports.renderProfile = function (req, res, id) {
		var user = res.locals.user;
		userl.findUserForView(user, id, function (err, tuser) {
			if (err) return res.renderErr(err);
			var params = photol.makeListParams(req, { uid: id });
			photol.findPhotos(params, function (err, photos, gt, lt) {
				if (err) return res.renderErr(err);
				res.render('user-profile', {
					tuser: tuser,
					showBtns: user && (user.admin || user._id === id),
					photos: photos,
					gtUrl: gt ? new UrlMaker(req.path).add('gt', gt, 0).toString() : undefined,
					ltUrl: lt ? new UrlMaker(req.path).add('lt', lt, 0).toString() : undefined
				});
			});
		});
	};

	app.get('/users/:id([0-9]+)/update', function (req, res) {
		req.checkUser(function (err, user) {
			if (err) return res.renderErr(err);
			var id = parseInt(req.params.id) || 0;
			userl.findUserForUpdate(id, user, function (err, tuser) {
				if (err) return res.renderErr(err);
				res.render('user-profile-update', {
					tuser: tuser
				});
			});
		});
	});

	app.get('/users/login', function (req, res) {
		res.render('user-login');
	});

	app.get('/users/register', function (req, res) {
		res.render('user-register');
	});

	app.get('/users/reset-req', function (req, res) {
		res.render('user-reset-req');
	});

	app.get('/users/reset', function (req, res) {
		res.render('user-reset');
	});

	app.get('/users/deactivate', function (req, res) {
		req.checkUser(function (err, user) {
			if (err) return res.renderErr(err);
			res.render('user-deactivate');
		});
	});

	app.get('/users', function (req, res) {
		userl.countUsers(function (err, count) {
			if (err) return res.renderErr(err);
			res.render('user-list', { count: count });
		});
	});

});
