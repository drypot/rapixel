var init = require('../base/init');
var error = require('../error/error');
var config = require('../config/config');
var express = require('../express/express');
var userb = require('../user/user-base');

init.add(function () {
  var app = express.app;

  app.get('/users', function (req, res) {
    userb.users.count(function (err, count) {
      if (err) return res.renderErr(err);
      res.render('user/user-list', { count: count });
    });
  });
});
