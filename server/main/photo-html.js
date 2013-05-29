var l = require('../main/l');
var init = require('../main/init');
var express = require('../main/express');
var photol = require('../main/photo');
var error = require('../main/error');
var UrlMaker = require('../main/UrlMaker');

init.add(function () {

	console.log('photo-html:');

	var app = express.app;

	app.get('/photos/:pid([0-9]+)', function (req, res) {
		var pid = parseInt(req.params.pid) || 0;
		photol.findPhoto(pid, function (err, photo) {
			if (err) return res.renderErr(err);
			photo.commentEscaped = l.escapeForHtml(photo.comment);
			photo.user.footerEscaped = l.escapeForHtml(photo.user.footer);
			res.render('photo-view', {
				photo: photo,
				photoView: true
			});
		});
	});

	app.get('/photos', function (req, res) {
		res.redirect('/');
	});

	app.get('/', function (req, res) {
		var pg = photol.getPage(req.query.pg);
		var ps = photol.getPageSize(req.query.ps);
		photol.findPhotos(pg, ps, function (err, photos, last) {
			if (err) return res.renderErr(err);
			prevNext(pg, last, function (prevUrl, nextUrl) {
				res.render('photo-list', {
					photos: photos,
					prevUrl: prevUrl,
					nextUrl: nextUrl,
					firstPage: pg == 1
				});
			});
		});
	});

	function prevNext(pg, last, next) {
		var prevUrl, nextUrl;
		var u;
		if (pg > 1) {
			u = new UrlMaker('/')
			u.add('pg', pg - 1, 1);
			prevUrl = u.toString();
		}
		if (!last) {
			u = new UrlMaker('/');
			u.add('pg', pg + 1, 1);
			nextUrl = u.toString();
		}
		next(prevUrl, nextUrl);
	}

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
