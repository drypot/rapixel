var init = require('../base/init');
var error = require('../base/error');
var express2 = require('../main/express');
var userb = require('../user/user-base');
var userc = require('../user/user-create');
var userv = require('../user/user-view');

init.add(function () {
  var app = express2.app;

  app.post('/api/sessions', function (req, res) {
    var form = getForm(req.body);
    createSessionWithForm(req, res, form, function (err, user) {
      if (err) return res.jsonErr(err);
      res.json({
        user: {
          id: user._id,
          name: user.name
        }
      });
    });
  });

  app.delete('/api/sessions', function (req, res) {
    exports.deleteSession(req, res);
    res.json({});
  });

  app.get('/users/login', function (req, res) {
    res.render('user/user-auth-login');
  });
});

express2.restoreLocalsUser = function (req, res, done) {
  if (req.session.uid) {
    return userv.getCached(req.session.uid, function (err, user) {
      if (err) {
        req.session.destroy();
        return done(err);
      }
      res.locals.user = user;
      done();
    });
  }
  if (res.locals.api) {
    return done();
  }
  createSessionAuto(req, res, done);
};

function getForm(body) {
  var form = {};
  form.email = String(body.email || '').trim();
  form.password = String(body.password || '').trim();
  form.remember = !!body.remember;
  return form;
};

function createSessionWithForm(req, res, form, done) {
  userv.findAndCache(form.email, function (err, user) {
    if (err) return done(err);
    validateUser(user, form.password, function (err) {
      if (err) return done(err);
      if (form.remember) {
        res.cookie('email', form.email, {
          maxAge: 99 * 365 * 24 * 60 * 60 * 1000,
          httpOnly: true
        });
        res.cookie('password', form.password, {
          maxAge: 99 * 365 * 24 * 60 * 60 * 1000,
          httpOnly: true
        });
      }
      createSessionWithUser(req, user, function (err) {
        if (err) return done(err);
        done(null, user);
      });
    })
  });
};

function createSessionAuto(req, res, done) {
  var email = req.cookies.email;
  var password = req.cookies.password;
  if (!email || !password) {
    return done();
  }
  userv.findAndCache(email, function (err, user) {
    if (err) return done(err);
    validateUser(user, password, function (err) {
      if (err) {
        res.clearCookie('email');
        res.clearCookie('password');
        return done();
      }
      createSessionWithUser(req, user, function (err) {
        if (err) return done(err);
        res.locals.user = user;
        done();
      });
    });
  });
}

function validateUser(user, password, done) {
  if (!user) {
    return done(error(error.EMAIL_NOT_FOUND));
  }
  if (user.status == 'd') {
    return done(error(error.ACCOUNT_DEACTIVATED));
  }
  if (!userc.checkPassword(password, user.hash)) {
    return done(error(error.PASSWORD_WRONG));
  }
  done();
}

function createSessionWithUser(req, user, done) {
  req.session.regenerate(function (err) {
    if (err) return done(err);
    var now = new Date();
    userb.users.update({ _id: user._id }, { $set: { adate: now } }, function (err) {
      if (err) return done(err);
      user.adate = now;
      req.session.uid = user._id;
      done();
    });
  });
}

exports.deleteSession = function (req, res) {
  res.clearCookie('email');
  res.clearCookie('password');
  req.session.destroy();
};

exports.getUser = function (res, done) {
  var user = res.locals.user;
  if (!user) {
    return done(error(error.NOT_AUTHENTICATED));
  }
  done(null, user);
};

exports.getAdmin = function (res, done) {
  var user = res.locals.user;
  if (!user) {
    return done(error(error.NOT_AUTHENTICATED));
  }
  if (!user.admin) {
    return done(error(error.NOT_AUTHORIZED));
  }
  done(null, user);
};
