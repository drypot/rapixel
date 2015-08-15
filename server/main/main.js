var init = require('../base/init');
var config = require('../base/config');
var expb = require('../express/express-base');

require('../user/user-new');
require('../user/user-view');
require('../user/user-list');
require('../user/user-update');
require('../user/user-deactivate');
require('../user/user-reset-pass');

require('../image/image-new');
require('../image/image-view');
require('../image/image-list');
require('../image/image-update');
require('../image/image-delete');
require('../image/image-listu');

require('../about/about-base');

init.run();
