var config = require('../base/config');

var request = require('superagent').agent();

exports.newSession = function () {
  request = require('superagent').agent();
};

['post', 'get', 'put', 'del'].forEach(function (method) {
  exports[method] = proxy(method);
});

function proxy(method) {
  return function () {
    arguments[0] = 'http://localhost:' + config.appPort + arguments[0];
    return request[method].apply(request, arguments);
  }
}
