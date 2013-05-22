var init = require('../main/init');
var upload = require('../main/upload');
var express = require('../main/express');

init.add(function () {

	var app = express.app;

	console.log('upload-api:');

	app.post('/api/upload', function (req, res) {
		req.findUser(function (err) {
			if (err) return res.jsonErr(err);
			res.json({
				files: upload.getTmpFiles(req.files.file)
			});
		});
	});

	app.del('/api/upload', function (req, res) {
		req.findUser(function (err) {
			if (err) return res.jsonErr(err);
			upload.deleteTmpFiles(req.body.files, function (err) {
				if (err) return res.jsonErr(err);
				res.json({});
			});
		});
	});

});
