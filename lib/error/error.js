var should = require('should');

var init = require('../lang/init');

exports = module.exports = function (obj) {
  var err;
  if (Array.isArray(obj)) {
    err = new Error(exports.MULTIPLE.message);
    err.code = exports.MULTIPLE.code;
    err.errors = obj;
    return err;
  }
  if (obj.field) {
    err = new Error(exports.MULTIPLE.message);
    err.code = exports.MULTIPLE.code;
    err.errors = [obj];
    return err;
  }
  if (obj.code) {
    err = new Error(obj.message);
    err.code = obj.code;
    return err;
  }
  err = new Error('unknown error');
  for (var p in obj) {
    err[p] = obj[p];
  }
  return err;
};

init.add(function () {
  exports.define('INVALID_DATA', '비정상적인 값이 입력되었습니다.');
  exports.define('MULTIPLE', '*');
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
  if (ec.field) {
    err.code.should.equal(exports.MULTIPLE.code);
    should(err.errors);
    for (var i = 0; i < err.errors.length; i++) {
      var e = err.errors[i];
      if (e.field == ec.field && e.message == ec.message) {
        return true;
      }
    }
    return false;
  }
  if (ec.code) {
    if (err.code == ec.code && err.message == ec.message) {
      return true;
    }
    return false;
  }
  return false;
}
