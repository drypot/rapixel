var init = require('../base/init');
var error = require('../base/error');
var exp = require('../main/express');
var userb = require('../user/user-base');
var userc = require('../user/user-create');
var usera = require('../user/user-auth');

init.add(function () {
  exp.core.put('/api/users/:id([0-9]+)', function (req, res, done) {
    usera.identifyUser(res, function (err, user) {
      if (err) return done(err);
      var id = parseInt(req.params.id) || 0;
      var form = userc.getForm(req.body);
      updateUser(id, user, form, function (err) {
        if (err) return done(err);
        res.json({});
      })
    });
  });

  exp.core.get('/users/:id([0-9]+)/update', function (req, res, done) {
    usera.identifyUser(res, function (err, user) {
      if (err) return done(err);
      var id = parseInt(req.params.id) || 0;
      checkUpdatable(id, user, function (err) {
        if (err) return done(err);
        usera.getCached(id, function (err, tuser) {
          if (err) return done(err);
          res.render('user/user-update', {
            tuser: tuser
          });
        });
      });
    });
  });
});

function updateUser(id, user, form, done) {
  checkUpdatable(id, user, function (err) {
    if (err) return done(err);
    form.namel = form.name.toLowerCase();
    form.homel = form.home.toLowerCase();
    userc.checkForm(form, id, function (err) {
      if (err) return done(err);
      var fields = {
        name: form.name,
        namel: form.namel,
        home: form.home,
        homel: form.homel,
        email: form.email,
        profile: form.profile
      };
      if (form.password.length) {
        fields.hash = userb.makeHash(form.password);
      }
      userb.users.update({ _id: id }, { $set: fields }, function (err, cnt) {
        if (err) return done(err);
        if (!cnt) {
          return done(error(error.USER_NOT_FOUND));
        }
        usera.deleteCache(id);
        done();
      });
    });
  });
};

var checkUpdatable = exports.checkUpdatable = function (id, user, done) {
  if (user._id != id && !user.admin) {
    return done(error(error.NOT_AUTHORIZED))
  }
  done();
}
