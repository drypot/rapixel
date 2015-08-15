var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config');
var expb = require('../express/express-base');
var userb = require('../user/user-base');

expb.core.get('/users', function (req, res, done) {
  userb.users.count(function (err, count) {
    if (err) return done(err);
    res.render('user/user-list', { count: count });
  });
});
