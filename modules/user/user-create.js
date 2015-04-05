var init = require('../base/init');
var error = require('../base/error');
var exp = require('../express/express');
var userb = require('../user/user-base');

init.add(function () {
  exp.core.post('/api/users', function (req, res, done) {
    var form = getForm(req);
    createUser(form, function (err, user) {
      if (err) return done(err);
      res.json({
        id: user._id
      });
    });
  });

  exp.core.get('/users/register', function (req, res, done) {
    res.render('user/user-create');
  });
});

var emailx = exports.emailx = /^[a-z0-9-_+.]+@[a-z0-9-]+(\.[a-z0-9-]+)+$/i

var getForm = exports.getForm = function (req) {
  var body = req.body;
  var form = {};
  form.name = String(body.name || '').trim();
  form.home = String(body.home || '').trim();
  form.email = String(body.email || '').trim();
  form.password = String(body.password || '').trim();
  form.profile = String(body.profile || '').trim();
  return form;
}

var createUser = exports.createUser = function (form, done) {
  form.home = form.name;
  form.homel = form.namel = form.name.toLowerCase();
  checkForm(form, 0, function (err) {
    if (err) return done(err);
    var now = new Date();
    var user = {
      _id: userb.newId(),
      name: form.name,
      namel: form.namel,
      home: form.home,
      homel: form.homel,
      email: form.email,
      hash: userb.makeHash(form.password),
      status: 'v',
      cdate: now,
      adate: now,
      profile: form.profile
    };
    // can't be set through form.
    if (form.admin) {
      user.admin = true;
    }
    userb.users.insert(user, function (err) {
      if (err) return done(err);
      done(null, user);
    });
  });
};

var checkForm = exports.checkForm = function (form, id, done) {
  var errors = [];
  var creating = id == 0;

  if (!form.name.length) {
    errors.push(error.NAME_EMPTY);
  } else if (form.name.length > 32 || form.name.length < 2) {
    errors.push(error.NAME_RANGE);
  }

  if (!form.home.length) {
    errors.push(error.HOME_EMPTY);
  } else if (form.home.length > 32 || form.home.length < 2) {
    errors.push(error.HOME_RANGE);
  }

  checkFormEmail(form, errors);

  if (creating || form.password.length) {
    checkFormPassword(form, errors);
  }

  countUsersByName(form.namel, id, function (err, cnt) {
    if (err) return done(err);
    if (cnt) {
      errors.push(error.NAME_DUPE);
    }
    countUsersByHome(form.homel, id, function (err, cnt) {
      if (err) return done(err);
      if (cnt) {
        errors.push(error.HOME_DUPE);
      }
      countUsersByEmail(form.email, id, function (err, cnt) {
        if (err) return done(err);
        if (cnt) {
          errors.push(error.EMAIL_DUPE);
        }
        if (errors.length) {
          return done(error(errors));
        }
        done();
      });
    });
  });
}

function countUsersByName(namel, id, done) {
  var q = { $or: [
    { namel: namel, _id : { $ne: id } },
    { homel: namel, _id : { $ne: id } }
  ]};
  userb.users.count(q, done);
};

function countUsersByHome(namel, id, done) {
  // countUserByName 과 평션정의가 같다. 정상이다. 들어오는 인자는 다르다.
  var q = { $or: [
    { namel: namel, _id : { $ne: id } },
    { homel: namel, _id : { $ne: id } }
  ]};
  userb.users.count(q, done);
};

function countUsersByEmail(email, id, done) {
  var q = { 
    email: email, _id: { $ne: id } 
  };
  userb.users.count(q, done);
};

var checkFormEmail = exports.checkFormEmail = function (form, errors) {
  if (!form.email.length) {
    errors.push(error.EMAIL_EMPTY);
  } else if (form.email.length > 64 || form.email.length < 8) {
    errors.push(error.EMAIL_RANGE);
  } else if (!emailx.test(form.email)) {
    errors.push(error.EMAIL_PATTERN);
  }
}

var checkFormPassword = exports.checkFormPassword = function (form, errors) {
  if (!form.password.length) {
    errors.push(error.PASSWORD_EMPTY);
  } else if (form.password.length > 32 || form.password.length < 4) {
    errors.push(error.PASSWORD_RANGE);
  }
}



