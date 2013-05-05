var init = require('../main/init');
var express = require('../main/express');
var photo = require('../main/photo');


init.add(function () {

	console.log('statics-html:');

	var app = express.app;

	console.log('photo-api:');

	app.get('/photos/upload', function (req, res) {
		req.user(function (err, u) {
			if (err) return res.renderErr(err);
			var now = new Date();
			photo.checkCycle(u, now, function (err) {
				if (err && err.rc === error.PHOTO_CYCLE) {
					err.message = err.hours + ' 시간 후에 재등록하실 수 있습니다.'
				}
				if (err) return res.renderErr(err);
				res.render('upload');
			});
		});
	});

	app.post('/photos/upload', function (req, res) {
		req.user(function (err, u) {
			if (err) return res.renderErr(err);
			photo.createPhoto(req, u, function (err, photoId) {
				if (err) return res.renderErr(err);
				res.redirect('/photos');
			});
		});
	});

	app.get('/photos', function (req, res) {
		var pg = parseInt(req.query.p) || 1;
		pg = pg < 1 ? 1 : pg;
		var pgsize = parseInt(req.query.ps) || 16;
		pgsize = pgsize > 64 ? 64 : pgsize < 1 ? 1 : pgsize;
		photo.list(pg, pgsize, function (err, photos, last) {
			if (err) return res.renderErr(err);
			res.render('photos',{
				photos: photos,
				last: last
			});
		});
	});

});
