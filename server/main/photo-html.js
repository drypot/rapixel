var l = require('../main/l');
var init = require('../main/init');
var express = require('../main/express');
var photol = require('../main/photo');
var error = require('../main/error');
var UrlMaker = require('../main/UrlMaker');

init.add(function () {

	console.log('photo-html:');

	var app = express.app;

	app.get('/photos/:id([0-9]+)', function (req, res) {
		var id = parseInt(req.params.id) || 0;
		photol.findPhoto(id, function (err, photo) {
			if (err) return res.renderErr(err);
			res.render('photo-view', {
				photo: photo,
				photoView: true
			});
		});
	});

	app.get('/photos/:id([0-9]+)/update', function (req, res) {
		var id = parseInt(req.params.id) || 0;
		photol.findPhoto(id, function (err, photo) {
			if (err) return res.renderErr(err);
			res.render('photo-update', {
				photo: photo
			});
		});
	});

	app.get('/photos', function (req, res) {
		res.redirect('/');
	});

	app.get('/', function (req, res) {
		var params = photol.makeListParams(req, {});
		photol.findPhotos(params, function (err, photos, gt, lt) {
			if (err) return res.renderErr(err);
			res.render('photo-list', {
				photos: photos,
				gtUrl: gt ? new UrlMaker('/').add('gt', gt, 0).toString() : undefined,
				ltUrl: lt ? new UrlMaker('/').add('lt', lt, 0).toString() : undefined
			});
		});
	});

	app.get('/photos/new', function (req, res) {
		req.findUser(function (err, user) {
			if (err) return res.renderErr(err);
			var now = new Date();
			photol.findHours(user, now, function (err, hours) {
				res.render('photo-new', {
					hours: hours
				});
			});
		});
	});

});
