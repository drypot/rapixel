var init = require('../base/init');
var error = require('../base/error');
var express2 = require('../main/express');
var userb = require('../user/user-base');
var userv = require('../user/user-view');
var usera = require('../user/user-auth');
var useru = require('../user/user-update');

init.add(function () {
  var app = express2.app;

  app.delete('/api/users/:id([0-9]+)', function (req, res) {
    usera.getUser(res, function (err, user) {
      if (err) return res.jsonErr(err);
      var id = parseInt(req.params.id) || 0;
      deactivateUser(id, user, function (err) {
        if (err) return res.jsonErr(err);
        usera.deleteSession(req, res);
        res.json({});
      });
    });
  });

  app.get('/users/deactivate', function (req, res) {
    usera.getUser(res, function (err, user) {
      if (err) return res.renderErr(err);
      res.render('user/user-deactivate');
    });
  });
});

function deactivateUser(id, user, done) {
  useru.checkUpdatable(id, user, function (err) {
    if (err) return done(err);
    userb.users.update({ _id: id }, { $set: { status: 'd' } }, function (err, cnt) {
      if (err) return done(err);
      if (!cnt) {
        return done(error(error.USER_NOT_FOUND));
      }
      userv.deleteCache(id);
      done();
    });
  });
};
