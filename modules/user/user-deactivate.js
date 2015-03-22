var init = require('../base/init');
var error = require('../base/error');
var exp = require('../main/express');
var userb = require('../user/user-base');
var usera = require('../user/user-auth');
var useru = require('../user/user-update');

init.add(function () {
  exp.core.delete('/api/users/:id([0-9]+)', function (req, res, done) {
    usera.checkUser(res, function (err, user) {
      if (err) return done(err);
      var id = parseInt(req.params.id) || 0;
      deactivateUser(id, user, function (err) {
        if (err) return done(err);
        usera.deleteSession(req, res);
        res.json({});
      });
    });
  });

  exp.core.get('/users/deactivate', function (req, res, done) {
    usera.checkUser(res, function (err, user) {
      if (err) return done(err);
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
      usera.deleteCache(id);
      done();
    });
  });
};
