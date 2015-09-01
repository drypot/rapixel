var bcrypt = require('bcrypt');
var crypto = require('crypto');

var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config');
var mongob = require('../mongo/mongo-base');
var expb = require('../express/express-base');
var userb = exports;

error.define('NOT_AUTHENTICATED', '먼저 로그인해 주십시오.');
error.define('NOT_AUTHORIZED', '사용 권한이 없습니다.');
error.define('USER_NOT_FOUND', '사용자를 찾을 수 없습니다.');
error.define('EMAIL_NOT_FOUND', '등록되지 않은 이메일입니다.', 'email');
error.define('ACCOUNT_DEACTIVATED', '사용중지된 계정입니다.', 'email');
error.define('PASSWORD_WRONG', '비밀번호가 틀렸습니다.', 'password');

error.define('NAME_EMPTY', '이름을 입력해 주십시오.', 'name');
error.define('NAME_RANGE', '이름 길이는 2 ~ 32 글자입니다.', 'name');
error.define('NAME_DUPE', '이미 등록되어 있는 이름입니다.', 'name');

error.define('HOME_EMPTY', '개인 주소를 입력해 주십시오.', 'home');
error.define('HOME_RANGE', '개인 주소 길이는 2 ~ 32 글자입니다.', 'home');
error.define('HOME_DUPE', '이미 등록되어 있는 개인 주소입니다.', 'home');

error.define('EMAIL_EMPTY', '이메일 주소를 입력해 주십시오.', 'email');
error.define('EMAIL_RANGE', '이메일 주소 길이는 8 ~ 64 글자입니다.', 'email');
error.define('EMAIL_PATTERN', '이메일 형식이 잘못되었습니다.', 'email');
error.define('EMAIL_DUPE', '이미 등록되어 있는 이메일입니다.', 'email');

error.define('PASSWORD_EMPTY', '비밀번호를 입력해 주십시오.', 'password');
error.define('PASSWORD_RANGE', '비밀번호 길이는 4 ~ 32 글자입니다.', 'password');

error.define('EMAIL_NOT_EXIST', '등록되지 않은 이메일입니다.', 'email');
error.define('RESET_TIMEOUT', '비밀번호 초기화 토큰 유효시간이 지났습니다.');

// users collection

var userId;

init.add(function (done) {
  userb.users = mongob.db.collection('users');
  userb.users.createIndex({ email: 1 }, function (err) {
    if (err) return done(err);
    userb.users.createIndex({ namel: 1 }, function (err) {
      if (err) return done(err);
      userb.users.createIndex({ homel: 1 }, done);
    });
  });
});

init.add(function (done) {
  mongob.getLastId(userb.users, function (err, id) {
    if (err) return done(err);
    userId = id;
    console.log('user-base: user id = ' + userId);
    done();
  });
});

userb.getNewId = function () {
  return ++userId;
};

// bcrypt hash

userb.makeHash = function (password) {
  return bcrypt.hashSync(password, 10);
}

var checkPassword = userb.checkPassword = function (password, hash) {
  return bcrypt.compareSync(password, hash);
}

// user cache

var usersById = [];
var usersByHome = {};

function cache(user) {
  usersById[user._id] = user;
  usersByHome[user.homel] = user;
}

userb.getCached = function (id, done) {
  var user = usersById[id];
  if (user) {
    return done(null, user);
  }
  userb.users.findOne({ _id: id }, function (err, user) {
    if (err) return done(err);
    if (!user) return done(error('USER_NOT_FOUND'));
    cache(user);
    done(null, user);
  });
};

userb.getCachedByHome = function (homel, done) {
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

userb.deleteCache = function (id) {
  var user = usersById[id];
  if (user) {
    delete usersById[id];
    delete usersByHome[user.homel];
  }
}

userb.resetCache = function () {
  usersById = [];
  usersByHome = {};
}

// authentication

userb.checkUser = function (res, done) {
  var user = res.locals.user;
  if (!user) {
    return done(error('NOT_AUTHENTICATED'));
  }
  done(null, user);
};

userb.checkAdmin = function (res, done) {
  var user = res.locals.user;
  if (!user) {
    return done(error('NOT_AUTHENTICATED'));
  }
  if (!user.admin) {
    return done(error('NOT_AUTHORIZED'));
  }
  done(null, user);
};

userb.checkUpdatable = function (user, id, done) {
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
    if (!checkPassword(password, user.hash)) {      
      return done(error('PASSWORD_WRONG'));
    }
    cache(user);    
    done(null, user);
  });
};

expb.core.get('/api/users/login', function (req, res, done) {
  userb.checkUser(res, function (err, user) {
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
  userb.logout(req, res);
  res.json({});
});

userb.logout = function (req, res, done) {
  res.clearCookie('email');
  res.clearCookie('password');
  req.session.destroy();
};
