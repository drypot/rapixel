var init = require('../base/init');
var util2 = require('../base/util');
var config = require('../base/config');

init.add(function () {
  util2.mergeObject(module.exports, require('./image-site-' + config.appType));
});
