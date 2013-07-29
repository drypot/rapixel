var init = require('./lib/lang/init');
var config = require('./lib/config/config');
var express = require('./lib/express/express');

// require('./lib/photo/photo-api');
// require('./lib/photo/photo-html');
// require('./lib//session-api');
// require('./lib//user-api');
// require('./lib//user-html');
// require('./lib//hello-api');
// require('./lib/about/about-html');
// require('./lib//upload-api');
// require('./lib//upload-html');
// require('./lib//user-profile-html');

init.run(function (err) {
	if (err) throw err;
	express.listen();
});
