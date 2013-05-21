var init = require('../main/init');
var express = require('../main/express');
var photo = require('../main/photo');
var error = require('../main/error');
var UrlMaker = require('../main/UrlMaker');

init.add(function () {

	console.log('photo-html:');

	var app = express.app;

	app.get('/photos/:pid([0-9]+)', function (req, res) {
		var pid = parseInt(req.params.pid) || 0;
		photo.findPhoto(pid, function (err, p) {
			if (err) return res.renderErr(err);
			res.render('photo-view', {
				photo: p,
				photoView: true
			});
		});
	});

	app.get('/photos', function (req, res) {
		res.redirect('/');
	});

	app.get('/', function (req, res) {
		var pg = parseInt(req.query.pg) || 1;
		pg = pg < 1 ? 1 : pg;
		var pgsize = parseInt(req.query.ps) || 16;
		pgsize = pgsize > 64 ? 64 : pgsize < 1 ? 1 : pgsize;
		photo.list(pg, pgsize, function (err, photos, last) {
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
		req.findUser(function (err, u) {
			if (err) return res.renderErr(err);
			var now = new Date();
			photo.checkCycle(u, now, function (err) {
				if (err && err.rc === error.PHOTO_CYCLE) {
					err.message = '하루에 한 장 등록하실 수 있습니다.\n다음 등록까지 ' + err.hours + ' 시간 남으셨습니다.'
				}
				if (err) return res.renderErr(err);
				res.render('photo-new');
			});
		});
	});

//	app.post('/photos/upload', function (req, res) {
//		req.findUser(function (err, u) {
//			if (err) return res.renderErr(err);
//			photo.createPhoto(req, u, function (err, photoId) {
//				if (err) return res.renderErr(err);
//				res.redirect('/');
//			});
//		});
//	});


});
