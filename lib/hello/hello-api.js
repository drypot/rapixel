var init = require('../main/init');
var config = require('../main/config');
var express = require('../main/express');

init.add(function () {

	console.log('hello-api:');

	express.app.get('/api/hello', function (req, res) {
		res.json({
			name: config.data.appName,
			time: Date.now()
		});
	});

});
