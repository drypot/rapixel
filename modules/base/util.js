var utilp = exports;

utilp.defineMethod = function (con, methodName, fn) {
  Object.defineProperty(
    con, methodName, { value : fn, writable: true, enumerable: false, configurable: true}
  );
}

utilp.find = function (a, fn) {
  for (var i = 0; i < a.length; i++) {
    var item = a[i];
    if (fn(item)) return item;
  }
  return null;
};

utilp.mergeObject = function () {
  var tar = arguments[0];
  for (var i = 1; i < arguments.length; i++) {
    var src = arguments[i];
    for (var p in src) {
      tar[p] = src[p];
    }
  }
}

utilp.mergeArray = function () {
  var tar = arguments[0];
  var fn = arguments[arguments.length -1];
  for (var a = 1; a < arguments.length - 1; a++) {
    var src = arguments[a];
    sloop:
    for (var s = 0; s < src.length; s++) {
      for (var t = 0; t < tar.length; t++) {
        if (fn(tar[t], src[s])) {
          tar[t] = src[s];
          continue sloop;
        }
      }
      tar.push(src[s]);
    }
  }
}

// 마지막 인자 콜백을 바로 호출. 
// 테스트 디버깅 용으로 만들었던 듯.

utilp.pass = function () {
  arguments[arguments.length - 1]();
}

function pad(number) {
  var r = String(number);
  if ( r.length === 1 ) {
    r = '0' + r;
  }
  return r;
}

utilp.toDateTimeString = function (d) {
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' +
    pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
};

utilp.makeUrl = function(url, params) {
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