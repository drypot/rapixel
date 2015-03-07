var should = require('should');
var request = require('superagent').agent();

var config = require('../base/config');


// user-fixture, user-auth-test 와 같이 여러 테스트 모듈이 세션을 공유할 필요가 있다.
// 각 모듈별로 supertest 류의 라이브러리를 각자 생성해서 사용하면 세션 공유에 문제가 발생한다.
// 세션을 별도 공용 모듈에서 유지해야한다.

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

exports.upload = function (file, count, done) {
  if (typeof count == 'function') {
    done = count;
    count = 1;
  }
  var req = exports.post('/api/upload');
  for (var i = 0; i < count; i++) {
    req.attach('files', file);
  }
  req.end(function (err, res) {
    should.not.exist(err);
    res.error.should.false;
    should.not.exist(res.body.err);
    res.body.files.should.length(count);
    done(null, res.body.files);
  });
};
