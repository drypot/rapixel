var init = require('../lang/init');
var upload = require('../upload/upload');
var express = require('../express/express');

init.add(function () {

	var app = express.app;

	console.log('upload-api:');

	app.post('/api/upload', function (req, res) {
		req.checkUser(function (err) {
			if (err) return res.jsonErr(err);
			res.json(upload.makeFiles(req));
		});
	});

	app.del('/api/upload', function (req, res) {
		req.checkUser(function (err) {
			if (err) return res.jsonErr(err);
			upload.deleteTmpFiles(req.body.files, function (err) {
				if (err) return res.jsonErr(err);
				res.json({});
			});
		});
	});

});
