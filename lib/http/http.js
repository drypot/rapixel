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