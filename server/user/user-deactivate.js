var init = require('../base/init');
var error = require('../base/error');
var expb = require('../express/express-base');
var userb = require('../user/user-base');
var usera = require('../user/user-auth');

expb.core.delete('/api/users/:id([0-9]+)', function (req, res, done) {
  usera.checkUser(res, function (err, user) {
    if (err) return done(err);
    var id = parseInt(req.params.id) || 0;
    usera.checkUpdatable(user, id, function (err) {
      if (err) return done(err);
      userb.users.updateOne({ _id: id }, { $set: { status: 'd' } }, function (err, cnt) {
        if (err) return done(err);
        if (!cnt) {
          return done(error('USER_NOT_FOUND'));
        }
        userb.deleteCache(id);
        usera.logout(req, res);
        res.json({});
      });
    });
  });
});

expb.core.get('/users/deactivate', function (req, res, done) {
  usera.checkUser(res, function (err, user) {
    if (err) return done(err);
    res.render('user/user-deactivate');
  });
});
