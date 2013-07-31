var init = require('../lang/init');
var express = require('../express/express');
var photol = require('../photo/photo');

init.add(function () {

	var app = express.app;

	console.log('photo-api:');

	app.get('/api/photos/:id([0-9]+)', function (req, res) {
		var id = parseInt(req.params.id) || 0;
		photol.incHit(id, function (err) {
			if (err) return express.jsonErr(res, err);
			photol.findPhoto(id, function (err, photo) {
				if (err) return express.jsonErr(res, err);
				res.json(photo);
			});
		});
	});

	app.get('/api/photos', function (req, res) {
		var params = photol.makeListParams(req);
		params.query = {};
		photol.findPhotos(params, function (err, photos, gt, lt) {
			if (err) return express.jsonErr(res, err);
			res.json({
				photos: photos,
				gt: gt,
				lt: lt
			});
		});
	});

	app.post('/api/photos', function (req, res) {
		userss.getUser(res, function (err, user) {
			if (err) return express.jsonErr(res, err);
			var form = photol.makeForm(req.body);
			photol.createPhoto(user, form, function (err, id) {
				if (err) return express.jsonErr(res, err);
				res.json({
					photo: {
						_id: id
					}
				});
			});
		});
	});

	app.put('/api/photos/:id([0-9]+)', function (req, res) {
		userss.getUser(res, function (err, user) {
			if (err) return express.jsonErr(res, err);
			var id = parseInt(req.params.id) || 0;
			var form = photol.makeForm(req.body);
			photol.checkUpdatable(id, user, function (err) {
				if (err) return express.jsonErr(res, err);
				photol.updatePhoto(id, form, function (err) {
					if (err) return express.jsonErr(res, err);
					res.json({});
				});
			});
		});
	});


	app.del('/api/photos/:id([0-9]+)', function (req, res) {
		userss.getUser(res, function (err, user) {
			if (err) return express.jsonErr(res, err);
			var id = parseInt(req.params.id) || 0;
			photol.checkUpdatable(id, user, function (err) {
				if (err) return express.jsonErr(res, err);
				photol.delPhoto(id, function (err) {
					if (err) return express.jsonErr(res, err);
					res.json({});
				});
			});
		});
	});

});
