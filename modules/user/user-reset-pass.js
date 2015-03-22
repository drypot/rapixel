var crypto = require('crypto');

var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config');
var mongo = require('../mongo/mongo');
var exp = require('../main/express');
var mailer = require('../mail/mailer');
var userb = require('../user/user-base');
var userc = require('../user/user-create');

init.add(function () {
  exp.core.post('/api/reset-pass', function (req, res, done) {
    var form = getForm1(req);
    step1(form, function (err) {
      if (err) return done(err);
      res.json({});
    });
  });

  exp.core.put('/api/reset-pass', function (req, res, done) {
    var form = getForm2(req);
    step2(form, function (err) {
      if (err) return done(err);
      res.json({});
    });
  });

  exp.core.get('/users/reset-pass', function (req, res, done) {
    res.render('user/user-reset-pass');
  });
});

function getForm1(req) {
  var form = {};
  form.email = String(req.body.email || '').trim();
  return form;
}

function step1(form, done) {
  var errors = [];
  userc.checkFormEmail(form, errors);
  if (errors.length) {
    return done(error(errors));
  }
  crypto.randomBytes(12, function(err, buf) {
    if (err) return done(err);
    var token = buf.toString('hex');
    userb.users.findOne({ email: form.email }, function (err, user) {
      if (err) return done(err);
      if (!user) {
        return done(error(error.EMAIL_NOT_EXIST));
      }
      userb.resets.remove({ email: form.email }, function (err) {
        if (err) return done(err);
        var reset = {
          email: form.email,
          token: token
        };
        userb.resets.insert(reset, function (err, resets) {
          if (err) return done(err);
          var reset = resets[0];
          var mail = {
            from: 'no-reply@raysoda.com',
            to: reset.email,
            subject: 'Reset Password - ' + config.appName,
            text:
              '\n' +
              'Open the following URL to reset your password.\n\n' +
              config.mainSiteUrl + '/users/reset-pass?step=3&id=' + reset._id + '&t=' + reset.token + '\n\n' +
              config.appName
          };
          mailer.send(mail, done);
        });
      });
    });
  });
};

function getForm2(req) {
  var body = req.body;
  var form = {};
  form.id = String(body.id || '').trim();
  form.token = String(body.token || '').trim();
  form.password = String(body.password || '').trim();
  return form;
}

function step2(form, done) {
  var errors = [];
  userc.checkFormPassword(form, errors);
  if (errors.length) {
    return done(error(errors));
  }
  userb.resets.findOne({ _id: new mongo.ObjectID(form.id) }, function (err, reset) {
    if (err) return done(err);
    if (!reset) {
      return done(error(error.INVALID_DATA));
    }
    if (form.token != reset.token) {
      return done(error(error.INVALID_DATA));
    }
    if (Date.now() - reset._id.getTimestamp().getTime() > 15 * 60 * 1000) {
      return done(error(error.RESET_TIMEOUT));
    }
    exports.updateHash(reset.email, form.password, true, function (err) {
      if (err) return done(err);
      userb.resets.remove({ _id: reset._id }, done);
    });
  });
};

exports.updateHash = function (email, password, excludeAdmin, done) {
  var hash = userb.makeHash(password);
  var query = { email: email };
  if (excludeAdmin) {
    query.admin = { $exists: false };
  }
  userb.users.update(query, { $set: { hash: hash } }, done)
}
