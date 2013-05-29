var init = require('../main/init');
var express = require('../main/express');
var photol = require('../main/photo');

init.add(function () {

	var app = express.app;

	console.log('photo-api:');

	app.post('/api/photos', function (req, res) {
		req.findUser(function (err, user) {
			if (err) return res.jsonErr(err);
			var form = photol.makeForm(req);
			photol.createPhoto(user, form, function (err, pid) {
				if (err) return res.jsonErr(err);
				res.json({
					pid: pid
				});
			});
		});
	});

	app.get('/api/photos/:pid([0-9]+)', function (req, res) {
		var pid = parseInt(req.params.pid) || 0;
		photol.findPhoto(pid, function (err, photo) {
			if (err) return res.jsonErr(err);
			res.json(photo);
		});
	});

	app.get('/api/photos', function (req, res) {
		var pg = photol.getPage(req.query.pg);
		var ps = photol.getPageSize(req.query.ps);
		photol.findPhotos(pg, ps, function (err, photos, last) {
			if (err) return res.jsonErr(err);
			res.json({
				photos: photos,
				last: last
			});
		});
	});

	app.del('/api/photos/:pid([0-9]+)', function (req, res) {
		req.findUser(function (err, user) {
			if (err) return res.jsonErr(err);
			var pid = parseInt(req.params.pid) || 0;
			photol.del(pid, user, function (err) {
				if (err) return res.jsonErr(err);
				res.json({});
			});
		});
	});

});
