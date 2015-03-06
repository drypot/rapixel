var init = require('../base/init');
var lang = require('../base/lang');
var config = require('../config/config');

init.add(function () {
  lang.merge(module.exports, require('./image-site-' + config.appType));
});
