var init = require('../main/init');
var express = require('../main/express');
var mongo = require('../main/mongo');

init.add(function () {

	console.log('static-html:');

	var app = express.app;

//	app.get('/', function (req, res) {
//		res.render('index');
//	});

	app.get('/company', function (req, res) {
		res.render('about-company');
	});

	app.get('/privacy', function (req, res) {
		res.render('about-privacy');
	});

	app.get('/help', function (req, res) {
		res.render('about-help');
	});

	app.get('/support', function (req, res) {
		res.render('about-help');
	});

	app.get('/error', function (req, res) {
		var err = new Error('Error Sample Page');
		err.rc = 999;
//		delete err.message;
//		delete err.stack;
		res.render('error', {
			err: err
		});
	});


});
