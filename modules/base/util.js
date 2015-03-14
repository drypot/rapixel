
exports.defineMethod = function (con, methodName, fn) {
  Object.defineProperty(
    con, methodName, { value : fn, writable: true, enumerable: false, configurable: true}
  );
}

exports.find = function (a, fn) {
  for (var i = 0; i < a.length; i++) {
    var item = a[i];
    if (fn(item)) return item;
  }
  return null;
};

exports.mergeObject = function () {
  var tar = arguments[0];
  for (var i = 1; i < arguments.length; i++) {
    var src = arguments[i];
    for (var p in src) {
      tar[p] = src[p];
    }
  }
}

// 마지막 인자 콜백을 바로 호출. 
// 테스트 디버깅 용으로 만들었던 듯.

exports.pass = function () {
  arguments[arguments.length - 1]();
}

function pad(number) {
  var r = String(number);
  if ( r.length === 1 ) {
    r = '0' + r;
  }
  return r;
}

exports.toDateTimeString = function (d) {
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' +
    pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
};

exports.makeUrl = function(url, params) {
  var qm;

  for(var p in params) {
    if (qm) {
      url += '&';
    } else {
      url += '?';
      qm = true;
    }
    url += p;
    url += '=';
    url += params[p];
  }

  return url;
};