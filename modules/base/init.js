var util = require('util');

process.on('uncaughtException', function (err) {
  console.error(err.stack);
});

/*
  async 한 모듈 초기화를 위한 유틸리티.
  가능한 async 한 부분에만 사용하고
  일반적인 정의들은 init.add 밖의 모듈 스코프에 두는 것이 부작용이 적다.
  일반 펑션을 init.add 안에 두면 init.add 간 펑션 사용에 문제가 발생.
*/

var funcs = [];
var tails = [];

exports.reset = function () {
  funcs = [];
  tails = [];
}

exports.add = function (func) {
  funcs.push(func);
};

exports.tail = function (func) {
  tails.unshift(func);
};

exports.run = function (done) {
  var i = 0;

  done = done || function (err) {
    if (err) throw err;
  };
  
  function run() {
    if (i == funcs.length) {
      funcs = [];
      tails = [];
      return done();
    }
    var func = funcs[i++];
    if (func.length == 0) {
      func();
      setImmediate(run);
    } else {
      func(function (err) {
        if (err) return done(err);
        setImmediate(run);
      });
    }
  };

  funcs = funcs.concat(tails);
  run();
};
