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
			res.render('user-list', { count: count });
		});
	});

	app.get('/users/login', function (req, res) {
		res.render('user-login', {
			newUser: req.query.hasOwnProperty('newuser')
		});
	});

	app.get('/users/register', function (req, res) {
		res.render('user-register');
	});

	app.get('/company', function (req, res) {
		res.render('about-company');
	});

	app.get('/privacy', function (req, res) {
		res.render('about-privacy');
	});

	app.get('/help', function (req, res) {
		res.render('about-help');
	});

});
