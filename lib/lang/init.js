var util = require('util');

var funcs = [];

process.on('uncaughtException', function (err) {
  console.error('UNCAUGHT EXCEPTION');
  if (err.stack) {
    console.error(err.stack);
  } else {
    console.error(util.inspect(err));
  }
});

exports.reset = function () {
  funcs = [];
}

exports.add = function (func) {
  if (func.length == 0) {
    funcs.push(function (done) {
      func();
      done();
    })
  } else {
    funcs.push(func);
  }
};

exports.run = function (done) {
  var i = 0;

  function run() {
    if (i == funcs.length) {
      funcs = [];
      return done();
    }
    var func = funcs[i++];
    func(function (err) {
      if (err) return done(err);
      setImmediate(run);
    });
  };

  run();
};
