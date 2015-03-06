var init = require('../base/init');
var config = require('../base/config');
var express2 = require('../main/express');

require('../image/image-create');
require('../image/image-view');
require('../image/image-list');
require('../image/image-update');
require('../image/image-delete');

require('../user/user-create');
require('../user/user-view');
require('../user/user-list');
require('../user/user-update');
require('../user/user-deactivate');
require('../user/user-reset');

require('../about/about');

require('../user-profile/user-profile');

init.run(function (err) {
  if (err) throw err;
  express2.listen();
});
