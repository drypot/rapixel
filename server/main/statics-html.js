var init = require('../main/init');
var express = require('../main/express');
var mongo = require('../main/mongo');

init.add(function () {

	console.log('statics-html:');

	var app = express.app;

	app.get('/', function (req, res) {
		mongo.users.count(function (err, count) {
			if (err) return res.renderErr(err);
			res.render('index', { count: count });
		})
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
