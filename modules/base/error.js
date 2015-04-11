var expect = require('../base/chai').expect;

var init = require('../base/init');

var error = exports = module.exports = function (ec /* error const */) {
  var err;
  if (Array.isArray(ec)) {
    err = new Error(error.INVALID_FORM.message);
    err.code = error.INVALID_FORM.code;
    err.errors = ec;
    return err;
  }
  if (ec.field) {
    err = new Error(error.INVALID_FORM.message);
    err.code = error.INVALID_FORM.code;
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

error.define = function (code, msg, field) {
  expect(error[code]).not.exist;
  var ec = error[code] = {
    code: code,
    message: msg
  };
  if (field) {
    ec.field = field;
  }
};

error.find = function (err, ec) {
  if (err.code == error.INVALID_FORM.code) {
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

error.define('INVALID_DATA', '비정상적인 값이 입력되었습니다.');
error.define('INVALID_FORM', '*');
