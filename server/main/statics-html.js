var init = require('../main/init');
var express = require('../main/express');

init.add(function () {

	console.log('statics-html:');

	var app = express.app;

	app.get('/company', function (req, res) {
		res.render('company');
	});

	app.get('/privacy', function (req, res) {
		res.render('privacy');
	});

	app.get('/help', function (req, res) {
		res.render('help');
	});

});
