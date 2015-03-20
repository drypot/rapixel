var fs = require('fs');

var init = require('../base/init');

var opt = {};
var argv = [];

exports = module.exports = function (_opt) {
  for(var p in _opt) {
    opt[p] = _opt[p];
  }
  return exports;
};

exports.development = process.env.NODE_ENV != 'production';

init.add(function (done) {
  var path = opt.path || undefined;

  var i = 2;
  while(i < process.argv.length) {
    var arg = process.argv[i++];
    if (arg == '--config') {
      path = process.argv[i++];
    } else {
      argv.push(arg);
    }
  }

  if (!path) {
    return done(new Error('specify configuration path'));
  }

  console.log('config: ' + path);
  fs.readFile(path, 'utf8', function (err, data) {
    if (err) return done(err);
    var _config = JSON.parse(data);
    for(var p in _config) {
      exports[p] = _config[p];
    }
    done();
  });
});
