var init = require('../lang/init');
var upload = require('../upload/upload');
var express = require('../express/express');

init.add(function () {

	var app = express.app;

	console.log('upload-html:');

	app.post('/upload', function (req, res) {
		req.checkUser(function (err) {
			if (err) return res.send(JSON.stringify(err));
			res.send(JSON.stringify(upload.makeFiles(req)));
		});
	});

});
