var init = require('../lang/init');
var config = require('../config/config');
var express = require('../express/express');

// require('../image/image-api');
// require('../image/image-html');
// require('..//session-api');
// require('..//user-api');
// require('..//user-html');
// require('..//hello-api');
// require('../about/about-html');
// require('..//upload-api');
// require('..//upload-html');
// require('..//user-profile-html');

init.run(function (err) {
	if (err) throw err;
	express.listen();
});
