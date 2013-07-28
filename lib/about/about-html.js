var init = require('../lang/init');
var express = require('../express/express');
var mongo = require('../mongo/mongo');

init.add(function () {

	console.log('static-html:');

	var app = express.app;

//	app.get('/', function (req, res) {
//		res.render('index');
//	});

	app.engine('jade', require('jade').renderFile);
	app.set('view engine', 'jade'); // default view engine
	app.set('views', process.cwd() + '/client/jade'); // view root


	app.get('/company', function (req, res) {
		res.render('about-company');
	});

	app.get('/services', function (req, res) {
		res.render('about-services');
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


});
