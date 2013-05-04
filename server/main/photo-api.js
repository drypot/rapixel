var init = require('../main/init');
var photo = require('../main/photo');
var express = require('../main/express');

init.add(function () {

	var app = express.app;

	console.log('photo-api:');

	app.post('/api/photos', function (req, res) {
		req.user(function (err, user) {
			if (err) return res.jsonErr(err);
			photo.createPhoto(req, user, function (err, photoId) {
				if (err) return res.jsonErr(err);
				res.json({
					photoId: photoId
				});
			});
		});
	});

	app.get('/api/photos/:pid([0-9]+)', function (req, res) {
		var pid = parseInt(req.params.pid) || 0;
		photo.findPhoto(pid, function (err, p) {
			if (err) return res.jsonErr(err);
			res.json(p);
		});
	});

	app.get('/api/photos', function (req, res) {
		var pg = parseInt(req.query.p) || 1;
		page = page < 1 ? 1 : page;
		var pgsize = parseInt(query.ps) || 16;
		pgsize = pgsize > 64 ? 64 : pgsize < 1 ? 1 : pgsize;
		photo.list(pg, pgsize, function (err, photos, last) {
			if (err) return res.jsonErr(err);
			res.json({
				photos: photos,
				last: last
			});
		});
	});

	app.del('/api/photos/:pid([0-9]+)', function (req, res) {
		req.user(function (err, u) {
			if (err) return res.jsonErr(err);
			var pid = parseInt(req.params.pid) || 0;
			photo.del(pid, u, function (err) {
				if (err) return res.jsonErr(err);
				res.jsonEmpty();
			});
		});
	});

});
