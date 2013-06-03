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
		var user = res.locals.user;
		userl.findUserForView(id, user, function (err, tuser) {
			if (err) return res.renderErr(err);
			var pg = photol.getPage(req.query.pg);
			var ps = photol.getPageSize(req.query.ps);
			photol.findPhotosByUser(id, pg, ps, function (err, photos, last) {
				if (err) return res.renderErr(err);
				prevNext(id, pg, last, function (prevUrl, nextUrl) {
					res.render('user-profile', {
						tuser: tuser,
						showActions: user && (user.admin || user._id === id),
						photos: photos,
						prevUrl: prevUrl,
						nextUrl: nextUrl,
						firstPage: pg == 1
					});
				});
			});
		});
	});

	function prevNext(id, pg, last, next) {
		var prevUrl, nextUrl;
		var u;
		if (pg > 1) {
			u = new UrlMaker('/users/' + id)
			u.add('pg', pg - 1, 1);
			prevUrl = u.toString();
		}
		if (!last) {
			u = new UrlMaker('/users/' + id);
			u.add('pg', pg + 1, 1);
			nextUrl = u.toString();
		}
		next(prevUrl, nextUrl);
	}

	app.get('/users/:id([0-9]+)/edit', function (req, res) {
		req.findUser(function (err, user) {
			if (err) return res.renderErr(err);
			var id = parseInt(req.params.id) || 0;
			userl.findUserForEdit(id, user, function (err, tuser) {
				if (err) return res.renderErr(err);
				res.render('user-profile-edit', {
					tuser: tuser
				});
			});
		});
	});

	app.get('/users/login', function (req, res) {
		res.render('user-login', {
			newUser: req.query.hasOwnProperty('newuser')
		});
	});

	app.get('/users/register', function (req, res) {
		res.render('user-register');
	});

	app.get('/users/req-reset', function (req, res) {
		res.render('user-req-reset');
	});

	app.get('/users/reset', function (req, res) {
		res.render('user-reset');
	});

	app.get('/users', function (req, res) {
		mongo.users.count(function (err, count) {
			if (err) return res.renderErr(err);
			res.render('user-list', { count: count });
		});
	});

});
