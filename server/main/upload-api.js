var init = require('../main/init');
var upload = require('../main/upload');
var express = require('../main/express');
var error = require('../main/error');

init.add(function () {

	var app = express.app;

	console.log('upload-api:');

	app.post('/api/upload', function (req, res) {
		req.role(function (err) {
			if (err) return res.jsonErr(err);
			res.json({
				files: upload.tmpFiles(req.files.file)
			});
		});
	});

	app.del('/api/upload', function (req, res) {
		req.role(function (err) {
			if (err) return res.jsonErr(err);
			upload.deleteTmpFiles(req.body.files);
			res.jsonEmpty();
		});
	});

});
