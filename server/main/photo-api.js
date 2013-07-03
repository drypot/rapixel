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
		var params = photol.makeListParams(req);
		params.query = {};
		photol.findPhotos(params, function (err, photos, gt, lt) {
			if (err) return res.jsonErr(err);
			res.json({
				photos: photos,
				gt: gt,
				lt: lt
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
			var id = parseInt(req.params.id) || 0;
			var form = photol.makeForm(req);
			photol.checkUpdatable(user, id, function (err) {
				if (err) return res.jsonErr(err);
				photol.updatePhoto(id, form, function (err) {
					if (err) return res.jsonErr(err);
					res.json({});
				});
			});
		});
	});


	app.del('/api/photos/:id([0-9]+)', function (req, res) {
		req.findUser(function (err, user) {
			if (err) return res.jsonErr(err);
			var id = parseInt(req.params.id) || 0;
			photol.checkUpdatable(user, id, function (err) {
				if (err) return res.jsonErr(err);
				photol.delPhoto(id, function (err) {
					if (err) return res.jsonErr(err);
					res.json({});
				});
			});
		});
	});

});
