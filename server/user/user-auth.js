var bcrypt = require('bcrypt');
var crypto = require('crypto');

var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config');
var mongob = require('../mongo/mongo-base');
var expb = require('../express/express-base');
var userb = require('../user/user-base');
var usera = exports;

// set-admin.js 등, express 가 필요없는 모듈에서 user-base 를 쓸 수 있도록 auth 부분을 분리한다.

// authentication

usera.checkUser = function (res, done) {
  var user = res.locals.user;
  if (!user) {
    return done(error('NOT_AUTHENTICATED'));
  }
  done(null, user);
};

usera.checkAdmin = function (res, done) {
  var user = res.locals.user;
  if (!user) {
    return done(error('NOT_AUTHENTICATED'));
  }
  if (!user.admin) {
    return done(error('NOT_AUTHORIZED'));
  }
  done(null, user);
};

usera.checkUpdatable = function (user, id, done) {
  if (user._id != id && !user.admin) {
    return done(error('NOT_AUTHORIZED'))
  }
  done();
};

// login

expb.redirectToLogin = function (err, req, res, done) {
  if (!res.locals.api && err.code == error.NOT_AUTHENTICATED.code) {
    res.redirect('/users/login');
  } else {
    done(err);
  }
};

expb.core.get('/users/login', function (req, res, done) {
  res.render('user/user-base-login');
});

expb.core.post('/api/users/login', function (req, res, done) {
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
    createSession(req, res, user, function (err, user) {
      if (err) return done(err);
      res.json({
        user: {
          id: user._id,
          name: user.name
        }
      });
    });
  });
});

expb.autoLogin = function (req, res, done) {
  if (req.session.uid) {
    userb.getCached(req.session.uid, function (err, user) {
      if (err) return req.session.regenerate(done);
      res.locals.user = user;
      done();
    });
    return;
  }
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
    createSession(req, res, user, done);
  });
};

function createSession(req, res, user, done) {
  req.session.regenerate(function (err) {
    if (err) return done(err);
    var now = new Date();
    userb.users.updateOne({_id: user._id}, {$set: {adate: now}}, function (err) {
      if (err) return done(err);
      user.adate = now;
      req.session.uid = user._id;
      res.locals.user = user;
      done(null, user);
    });
  });
}

function findUser(email, password, done) {
  userb.users.findOne({ email: email }, function (err, user) {
    if (err) return done(err);
    if (!user) {
      return done(error('EMAIL_NOT_FOUND'));
    }
    if (user.status == 'd') {
      return done(error('ACCOUNT_DEACTIVATED'));
    }    
    if (!userb.checkPassword(password, user.hash)) {      
      return done(error('PASSWORD_WRONG'));
    }
    userb.cache(user);    
    done(null, user);
  });
};

expb.core.get('/api/users/login', function (req, res, done) {
  usera.checkUser(res, function (err, user) {
    if (err) return done(err);
    res.json({
      user: {
        id: user._id,
        name: user.name        
      }
    });
  });
});

// logout

expb.core.post('/api/users/logout', function (req, res, done) {
  usera.logout(req, res);
  res.json({});
});

usera.logout = function (req, res, done) {
  res.clearCookie('email');
  res.clearCookie('password');
  req.session.destroy();
};
