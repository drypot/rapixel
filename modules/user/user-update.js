var init = require('../base/init');
var error = require('../base/error');
var exp = require('../express/express');
var userb = require('../user/user-base');
var userc = require('../user/user-create');

exp.core.put('/api/users/:id([0-9]+)', function (req, res, done) {
  userb.checkUser(res, function (err, user) {
    if (err) return done(err);
    var id = parseInt(req.params.id) || 0;
    var form = userc.getForm(req);
    userb.checkUpdatable(id, user, function (err) {
      if (err) return done(err);
      updateUser(id, user, form, function (err) {
        if (err) return done(err);
        res.json({});
      });
    });
  });
});

exp.core.get('/users/:id([0-9]+)/update', function (req, res, done) {
  userb.checkUser(res, function (err, user) {
    if (err) return done(err);
    var id = parseInt(req.params.id) || 0;
    userb.checkUpdatable(id, user, function (err) {
      if (err) return done(err);
      userb.getCached(id, function (err, tuser) {
        if (err) return done(err);
        res.render('user/user-update', {
          tuser: tuser
        });
      });
    });
  });
});

function updateUser(id, user, form, done) {
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
    userb.users.updateOne({ _id: id }, { $set: fields }, function (err, r) {
      if (err) return done(err);
      if (!r.modifiedCount) {
        return done(error(error.USER_NOT_FOUND));
      }
      userb.deleteCache(id);
      done();
    });
  });
};
