var util = require('util');

var funcs = [];
var tails = [];

process.on('uncaughtException', function (err) {
  console.error(err.stack);
});

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
