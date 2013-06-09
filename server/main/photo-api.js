var init = require('../main/init');
var express = require('../main/express');
var photol = require('../main/photo');

init.add(function () {

	var app = express.app;

	console.log('photo-api:');

	app.get('/api/photos/:id([0-9]+)', function (req, res) {
		var id = parseInt(req.params.id) || 0;
		photol.findPhoto(id, function (err, photo) {
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

	app.post('/api/photos', function (req, res) {
		req.findUser(function (err, user) {
			if (err) return res.jsonErr(err);
			var form = photol.makeForm(req);
			photol.createPhoto(user, form, function (err, id) {
				if (err) return res.jsonErr(err);
				res.json({
					photo: {
						_id: id
					}
				});
			});
		});
	});

	app.put('/api/photos/:id([0-9]+)', function (req, res) {
		req.findUser(function (err, user) {
			if (err) return res.jsonErr(err);
			var form = photol.makeForm(req);
			form._id = parseInt(req.params.id) || 0;
			photol.updatePhoto(user, form, function (err) {
				if (err) return res.jsonErr(err);
				res.json();
			});
		});
	});


	app.del('/api/photos/:id([0-9]+)', function (req, res) {
		req.findUser(function (err, user) {
			if (err) return res.jsonErr(err);
			var id = parseInt(req.params.id) || 0;
			photol.delPhoto(id, user, function (err) {
				if (err) return res.jsonErr(err);
				res.json();
			});
		});
	});

});
