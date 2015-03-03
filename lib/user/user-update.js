var init = require('../lang/init');
var error = require('../error/error');
var express = require('../express/express');
var userb = require('../user/user-base');
var userc = require('../user/user-create');
var userv = require('../user/user-view');
var usera = require('../user/user-auth');

init.add(function () {
  var app = express.app;

  app.put('/api/users/:id([0-9]+)', function (req, res) {
    usera.getUser(res, function (err, user) {
      if (err) return res.jsonErr(err);
      var id = parseInt(req.params.id) || 0;
      var form = userc.getForm(req.body);
      updateUser(id, user, form, function (err) {
        if (err) return res.jsonErr(err);
        res.json({});
      })
    });
  });

  app.get('/users/:id([0-9]+)/update', function (req, res) {
    usera.getUser(res, function (err, user) {
      if (err) return res.renderErr(err);
      var id = parseInt(req.params.id) || 0;
      exports.checkUpdatable(id, user, function (err) {
        if (err) return res.renderErr(err);
        userv.getCached(id, function (err, tuser) {
          if (err) return res.renderErr(err);
          res.render('user/user-update', {
            tuser: tuser
          });
        });
      });
    });
  });
});

function updateUser(id, user, form, done) {
  exports.checkUpdatable(id, user, function (err) {
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
        fields.hash = userc.makeHash(form.password);
      }
      userb.users.update({ _id: id }, { $set: fields }, function (err, cnt) {
        if (err) return done(err);
        if (!cnt) {
          return done(error(error.USER_NOT_FOUND));
        }
        userv.deleteCache(id);
        done();
      });
    });
  });
};

exports.checkUpdatable = function (id, user, done) {
  if (user._id != id && !user.admin) {
    return done(error(error.NOT_AUTHORIZED))
  }
  done();
}
