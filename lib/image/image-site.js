var init = require('../lang/init');
var config = require('../config/config');

init.add(function () {
	module.exports = require('./image-site-' + config.appType);
});
