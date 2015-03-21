var bcrypt = require('bcrypt');
var crypto = require('crypto');

var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config');
var mongo = require('../mongo/mongo');

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

var userId;

init.add(function (done) {
  var opt = {
    fields: { _id: 1 },
    sort: { _id: -1 },
    limit: 1
  }
  users.find({}, opt).nextObject(function (err, obj) {
    if (err) return done(err);
    userId = obj ? obj._id : 0;
    console.log('user-base: user id = ' + userId);
    done();
  });
});

init.add(function (done) {
  exports.resets = mongo.db.collection("resets");
  exports.resets.ensureIndex({ email: 1 }, done);
});

exports.newId = function () {
  return ++userId;
};

exports.makeHash = function (password) {
  return bcrypt.hashSync(password, 10);
}

exports.checkPassword = function (password, hash) {
  return bcrypt.compareSync(password, hash);
}
