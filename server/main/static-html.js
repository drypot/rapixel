var init = require('../main/init');
var express = require('../main/express');
var mongo = require('../main/mongo');

init.add(function () {

	console.log('static-html:');

	var app = express.app;

//	app.get('/', function (req, res) {
//		res.render('index');
//	});

	app.get('/users', function (req, res) {
		mongo.users.count(function (err, count) {
			if (err) return res.renderErr(err);
			res.render('users', { count: count });
		});
	});

	app.get('/users/login', function (req, res) {
		res.render('login');
	});

	app.get('/users/register', function (req, res) {
		res.render('register');
	});

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
