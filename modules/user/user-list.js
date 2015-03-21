var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config');
var express2 = require('../main/express');
var userb = require('../user/user-base');

init.add(function () {
  var core = express2.core;

  core.get('/users', function (req, res, done) {
    userb.users.count(function (err, count) {
      if (err) return done(err);
      res.render('user/user-list', { count: count });
    });
  });
});
