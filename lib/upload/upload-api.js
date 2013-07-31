var init = require('../lang/init');
var upload = require('../upload/upload');
var express = require('../express/express');

init.add(function () {

	var app = express.app;

	app.post('/api/upload', function (req, res) {
		userss.getUser(res, function (err, user) {
			if (req.rtype === 'html') {
				if (err) return res.send(JSON.stringify(err));
				res.send(JSON.stringify(upload.getTmpNames(req)));
				return;
			}
			if (err) return express.jsonErr(res, err);
			res.json(upload.getTmpNames(req));
		});
	});

	app.del('/api/upload', function (req, res) {
		userss.getUser(res, function (err, user) {
			if (err) return express.jsonErr(res, err);
			upload.deleteTmpFiles(req.body.files, function (err) {
				if (err) return express.jsonErr(res, err);
				res.json({});
			});
		});
	});

});
