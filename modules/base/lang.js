
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

exports.merge = function () {
  var tar = arguments[0];
  for (var i = 1; i < arguments.length; i++) {
    var src = arguments[i];
    for (var p in src) {
      tar[p] = src[p];
    }
  }
}

exports.pass = function () {
  arguments[arguments.length - 1]();
}
