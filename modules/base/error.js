var assertp = require('../base/assert');
var expect = assertp.expect;

var error = exports = module.exports = function (obj) {
  var err;
  if (Array.isArray(obj)) {
    err = new Error(error.INVALID_FORM.message);
    err.code = error.INVALID_FORM.code;
    err.errors = obj;
    return err;
  }
  var ec = error[obj];
  if (!ec) {
    err = new Error('unknown error');
    for (var p in obj) {
      err[p] = obj[p];
    }
    return err;
  }
  if (ec.field) {
    err = new Error(error.INVALID_FORM.message);
    err.code = error.INVALID_FORM.code;
    err.errors = [ec];
    return err;
  }
  err = new Error(ec.message);
  err.code = ec.code;
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

error.define('INVALID_DATA', '비정상적인 값이 입력되었습니다.');
error.define('INVALID_FORM', '*');

error.find = function (act, exp) {
  if (act.code === error.INVALID_FORM.code) {
    for (var i = 0; i < act.errors.length; i++) {
      var e = act.errors[i];
      if (e.code === exp.code && e.field === exp.field && e.message === exp.message) {
        return true;
      }
    }
  } else {
    if (act.code === exp.code && act.message === exp.message) {
      return true;
    }
  }
  return false;
};

assertp.chai.use(function (chai, utils) {
  var Assertion = chai.Assertion;
  Assertion.addMethod('error', function (code) {
    var act = this._obj;
    var exp = error[code];
    new Assertion(exp).property('code');
    new Assertion(exp).property('message');
    this.assert(
      error.find(act, exp),
      "expected #{this.code} to be #{exp} but got #{act}",
      "expected #{this.code} not to be #{exp}",
      exp.code,
      act.code
    );    
  });
});
