var init = require('../lang/init');
var lang = require('../lang/lang');
var config = require('../config/config');

init.add(function () {
  lang.merge(module.exports, require('./image-site-' + config.appType));
});
