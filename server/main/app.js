
process.on('uncaughtException', function (err) {
	console.error('UNCAUGHT EXCEPTION');
	if (err.stack) {
		console.error(err.stack);
	} else {
		console.log(require('util').inspect(err));
	}
});

var configPath;

for (var i = 2; i < process.argv.length; i++) {
	var arg = process.argv[i];
	if (arg.indexOf('--') === 0) {
		//
	} else {
		configPath = arg;
	}
}

var init = require('../main/init');
var config = require('../main/config')({ path: configPath });
var express = require('../main/express');

require('../main/photo-api');
require('../main/photo-html');
require('../main/session-api');
require('../main/user-api');
require('../main/hello-api');
require('../main/static-html');

init.run(function (err) {
	if (err) throw err;
	express.listen();
});
