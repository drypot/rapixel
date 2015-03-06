var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config');
var express2 = require('../main/express');
var userb = require('../user/user-base');

init.add(function () {
  var app = express2.app;

  app.get('/users', function (req, res) {
    userb.users.count(function (err, count) {
      if (err) return res.renderErr(err);
      res.render('user/user-list', { count: count });
    });
  });
});
