var init = require('../base/init');
var error = require('../base/error');
var exp = require('../main/express');
var userb = require('../user/user-base');

init.add(function () {
  /* restore locals.user. */
  exp.before.use(function (req, res, done) {
    if (req.session.uid) {
      getCached(req.session.uid, function (err, user) {
        if (err) {
          req.session.destroy();
          return done(err);
        }
        res.locals.user = user;
        done();
      });
    } else {
      createSessionAuto(req, res, done);
    }
  });

  exp.core.get('/api/session', function (req, res, done) {
    var obj = {
      uid : req.session.uid
    };
    var user = res.locals.user;
    if (user) {
      obj.user = {
        id: user._id,
        name: user.name        
      }
    }
    res.json(obj);
  });

  exp.core.post('/api/session', function (req, res, done) {
    createSessionForm(req, res, function (err, user) {
      if (err) return done(err);
      res.json({
        user: {
          id: user._id,
          name: user.name
        }
      });
    });
  });

  exp.core.delete('/api/session', function (req, res, done) {
    exports.deleteSession(req, res);
    res.json({});
  });

  exp.core.get('/users/login', function (req, res, done) {
    res.render('user/user-auth-login');
  });
});

init.tail(function () {
  exp.app.use(function (err, req, res, done) {
    if (!res.locals.api && err.code == error.NOT_AUTHENTICATED.code) {
      res.redirect('/users/login');
    } else {
      done(err);
    }
  });
})

/* cache */

var users = [];
var usersByHome = {};

function cache(user) {
  users[user._id] = user;
  usersByHome[user.homel] = user;
}

var getCached = exports.getCached = function (id, done) {
  var user = users[id];
  if (user) {
    return done(null, user);
  }
  userb.users.findOne({ _id: id }, function (err, user) {
    if (err) return done(err);
    if (!user) return done(error(error.USER_NOT_FOUND));
    cache(user);
    done(null, user);
  });
};

exports.getCachedByHome = function (homel, done) {
  var user = usersByHome[homel];
  if (user) {
    return done(null, user);
  }
  userb.users.findOne({ homel: homel }, function (err, user) {
    if (err) return done(err);
    if (!user) {
      // 사용자 프로필 URL 검색에 주로 사용되므로 error 생성은 패스한다.
      return done();
    }
    cache(user);
    done(null, user);
  });
};

exports.deleteCache = function (id) {
  var user = users[id];
  if (user) {
    delete users[id];
    delete usersByHome[user.homel];
  }
}

/* session */

function createSessionForm(req, res, done) {
  var form = {};
  form.email = String(req.body.email || '').trim();
  form.password = String(req.body.password || '').trim();
  form.remember = !!req.body.remember;
  findUser(form.email, form.password, function (err, user) {
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
    createSession(req, user, function (err) {
      if (err) return done(err);
      done(null, user);
    });
  });
};

function createSessionAuto(req, res, done) {
  var email = req.cookies.email;
  var password = req.cookies.password;
  if (!email || !password) {
    return done();
  }
  findUser(email, password, function (err, user) {
    if (err) {
      res.clearCookie('email');
      res.clearCookie('password');
      return done();
    }
    createSession(req, user, function (err) {
      if (err) return done(err);
      res.locals.user = user;
      done();
    });
  });
}

function findUser(email, password, done) {
  userb.users.findOne({ email: email }, function (err, user) {
    if (err) return done(err);
    if (!user) {
      return done(error(error.EMAIL_NOT_FOUND));
    }
    if (user.status == 'd') {
      return done(error(error.ACCOUNT_DEACTIVATED));
    }    
    if (!userb.checkPassword(password, user.hash)) {      
      return done(error(error.PASSWORD_WRONG));
    }
    cache(user);    
    done(null, user);
  });
};

function createSession(req, user, done) {
  req.session.regenerate(function (err) {
    if (err) return done(err);
    var now = new Date();
    userb.users.update({_id: user._id}, {$set: {adate: now}}, function (err) {
      if (err) return done(err);
      user.adate = now;
      req.session.uid = user._id;
      done();
    });
  });
}

exports.deleteSession = function (req, res, done) {
  res.clearCookie('email');
  res.clearCookie('password');
  req.session.destroy();
};

/* identify */

exports.identifyUser = function (res, done) {
  var user = res.locals.user;
  if (!user) {
    return done(error(error.NOT_AUTHENTICATED));
  }
  done(null, user);
};

exports.identifyAdmin = function (res, done) {
  var user = res.locals.user;
  if (!user) {
    return done(error(error.NOT_AUTHENTICATED));
  }
  if (!user.admin) {
    return done(error(error.NOT_AUTHORIZED));
  }
  done(null, user);
};

