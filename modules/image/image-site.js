var init = require('../base/init');
var utilp = require('../base/util');
var config = require('../base/config');

init.add(function () {
  utilp.mergeObject(module.exports, require('./image-site-' + config.appType));
});
