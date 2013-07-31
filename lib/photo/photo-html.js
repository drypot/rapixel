var lang = require('../lang/lang');
var init = require('../lang/init');
var express = require('../express/express');
var photol = require('../photo/photo');
var error = require('../error/error');
var UrlMaker = require('../http/UrlMaker');

init.add(function () {

	console.log('photo-html:');

	var app = express.app;

	app.get('/photos/:id([0-9]+)', function (req, res) {
		var id = parseInt(req.params.id) || 0;
		photol.incHit(id, function (err) {
			if (err) return express.jsonErr(res, err);
			photol.findPhoto(id, function (err, photo) {
				if (err) return express.renderErr(res, err);
				res.render('photo-view', {
					photo: photo,
					photoView: true
				});
			});
		});
	});

	app.get('/photos/:id([0-9]+)/update', function (req, res) {
		usera.getUser(res, function (err, user) {
			if (err) return express.renderErr(res, err);
			var id = parseInt(req.params.id) || 0;
			photol.checkUpdatable(id, user, function (err, photo) {
				if (err) return express.renderErr(res, err);
				res.render('photo-update', {
					photo: photo
				});
			});
		});
	});

	app.get('/photos', function (req, res) {
		res.redirect('/');
	});

	app.get('/', function (req, res) {
		var params = photol.makeListParams(req, {});
		photol.findPhotos(params, function (err, photos, gt, lt) {
			if (err) return express.renderErr(res, err);
			res.render('photo-list', {
				photos: photos,
				gtUrl: gt ? new UrlMaker('/').add('gt', gt, 0).toString() : undefined,
				ltUrl: lt ? new UrlMaker('/').add('lt', lt, 0).toString() : undefined
			});
		});
	});

	app.get('/photos/new', function (req, res) {
		usera.getUser(res, function (err, user) {
			if (err) return express.renderErr(res, err);
			var now = new Date();
			photol.findHours(user, now, function (err, hours) {
				res.render('photo-new', {
					hours: hours
				});
			});
		});
	});

});
