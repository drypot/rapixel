var init = require('../lang/init');
var config = require('../config/config');
var express = require('../express/express');

init.add(function () {

	console.log('hello-api:');

	express.app.get('/api/hello', function (req, res) {
		res.json({
			name: config.data.appName,
			time: Date.now()
		});
	});

});
