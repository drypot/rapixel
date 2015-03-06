var should = require('should');

var init = require('../base/init');

exports = module.exports = function (ec /* error const */) {
  var err;
  if (Array.isArray(ec)) {
    err = new Error(exports.INVALID_FORM.message);
    err.code = exports.INVALID_FORM.code;
    err.errors = ec;
    return err;
  }
  if (ec.field) {
    err = new Error(exports.INVALID_FORM.message);
    err.code = exports.INVALID_FORM.code;
    err.errors = [ec];
    return err;
  }
  if (ec.code) {
    err = new Error(ec.message);
    err.code = ec.code;
    return err;
  }
  err = new Error('unknown error');
  for (var p in ec) {
    err[p] = ec[p];
  }
  return err;
};

init.add(function () {
  exports.define('INVALID_DATA', '비정상적인 값이 입력되었습니다.');
  exports.define('INVALID_FORM', '*');
});

exports.define = function (code, msg, field) {
  should.not.exist(exports[code]);
  var ec = exports[code] = {
    code: code,
    message: msg
  };
  if (field) {
    ec.field = field;
  }
};

exports.find = function (err, ec) {
  if (err.code == exports.INVALID_FORM.code) {
    for (var i = 0; i < err.errors.length; i++) {
      var e = err.errors[i];
      if (e.code == ec.code && e.field == ec.field && e.message == ec.message) {
        return true;
      }
    }
  } else {
    if (err.code == ec.code && err.message == ec.message) {
      return true;
    }
  }
  return false;
}
