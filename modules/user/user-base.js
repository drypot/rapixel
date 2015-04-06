var bcrypt = require('bcrypt');
var crypto = require('crypto');

var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config');
var mongo = require('../mongo/mongo');
var exp = require('../express/express');

init.add(function () {
  error.define('NOT_AUTHENTICATED', '먼저 로그인해 주십시오.');
  error.define('NOT_AUTHORIZED', '사용 권한이 없습니다.');
  error.define('USER_NOT_FOUND', '사용자를 찾을 수 없습니다.');
  error.define('RESET_TIMEOUT', '비밀번호 초기화 토큰 유효시간이 지났습니다.');

  // user register

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

  // user login

  error.define('EMAIL_NOT_FOUND', '등록되지 않은 이메일입니다.', 'email');
  error.define('ACCOUNT_DEACTIVATED', '사용중지된 계정입니다.', 'email');
  error.define('PASSWORD_WRONG', '비밀번호가 틀렸습니다.', 'password');

  // request reset

  error.define('EMAIL_NOT_EXIST', '등록되지 않은 이메일입니다.', 'email');
});


// users collection

var users;

init.add(function (done) {
  users = exports.users = mongo.db.collection("users");
  users.ensureIndex({ email: 1 }, function (err) {
    if (err) return done(err);
    users.ensureIndex({ namel: 1 }, function (err) {
      if (err) return done(err);
      users.ensureIndex({ homel: 1 }, done);
    });
  });
});

// userId

init.add(function (done) {
  var userId;

  exports.newId = function () {
    return ++userId;
  };

  var opt = {
    fields: { _id: 1 },
    sort: { _id: -1 },
    limit: 1
  };
  users.find({}, opt).nextObject(function (err, obj) {
    if (err) return done(err);
    userId = obj ? obj._id : 0;
    console.log('user-base: user id = ' + userId);
    done();
  });
});

// bcrypt hash

exports.makeHash = function (password) {
  return bcrypt.hashSync(password, 10);
}

var checkPassword = exports.checkPassword = function (password, hash) {
  return bcrypt.compareSync(password, hash);
}

// user cache

var usersById = [];
var usersByHome = {};

function cache(user) {
  usersById[user._id] = user;
  usersByHome[user.homel] = user;
}

var getCached = exports.getCached = function (id, done) {
  var user = usersById[id];
  if (user) {
    return done(null, user);
  }
  users.findOne({ _id: id }, function (err, user) {
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
  users.findOne({ homel: homel }, function (err, user) {
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
  var user = usersById[id];
  if (user) {
    delete usersById[id];
    delete usersByHome[user.homel];
  }
}

exports.resetCache = function () {
  usersById = [];
  usersByHome = {};
}

// session

init.add(function () {

  exp.before.use(function (req, res, done) {
    createSessionAuto(req, res, done);
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

  exp.core.delete('/api/session', function (req, res, done) {
    deleteSession(req, res);
    res.json({});
  });

  exp.core.get('/users/login', function (req, res, done) {
    res.render('user/user-base-login');
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
});

function createSessionAuto(req, res, done) {
  if (req.session.uid) {
    getCached(req.session.uid, function (err, user) {
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
}

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
    createSession(req, res, user, done);
  });
};

function createSession(req, res, user, done) {
  req.session.regenerate(function (err) {
    if (err) return done(err);
    var now = new Date();
    users.update({_id: user._id}, {$set: {adate: now}}, function (err) {
      if (err) return done(err);
      user.adate = now;
      req.session.uid = user._id;
      res.locals.user = user;
      done(null, user);
    });
  });
}

function findUser(email, password, done) {
  users.findOne({ email: email }, function (err, user) {
    if (err) return done(err);
    if (!user) {
      return done(error(error.EMAIL_NOT_FOUND));
    }
    if (user.status == 'd') {
      return done(error(error.ACCOUNT_DEACTIVATED));
    }    
    if (!checkPassword(password, user.hash)) {      
      return done(error(error.PASSWORD_WRONG));
    }
    cache(user);    
    done(null, user);
  });
};

var deleteSession = exports.deleteSession = function (req, res, done) {
  res.clearCookie('email');
  res.clearCookie('password');
  req.session.destroy();
};

exports.checkUser = function (res, done) {
  var user = res.locals.user;
  if (!user) {
    return done(error(error.NOT_AUTHENTICATED));
  }
  done(null, user);
};

exports.checkAdmin = function (res, done) {
  var user = res.locals.user;
  if (!user) {
    return done(error(error.NOT_AUTHENTICATED));
  }
  if (!user.admin) {
    return done(error(error.NOT_AUTHORIZED));
  }
  done(null, user);
};
