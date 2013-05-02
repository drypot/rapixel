var init = require('../main/init');
var photo = require('../main/photo');
var express = require('../main/express');
var error = require('../main/error');

init.add(function () {

	var app = express.app;

	console.log('upload-api:');

	app.post('/api/photos', function (req, res) {
		req.user(function (err, user) {
			if (err) return res.jsonErr(err);
			upload.uploadPhoto(req.files.file, function (err, photoId) {
				if (err) return res.jsonErr(err);
				res.json({
					photoId: photoId
				});
			});
		});
	});

	app.del('/api/upload', function (req, res) {
		req.user(function (err) {
			if (err) return res.jsonErr(err);
			upload.deleteTmpFiles(req.body.files);
			res.jsonEmpty();
		});
	});

});
