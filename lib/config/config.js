var fs = require('fs');

var init = require('../lang/init');

var opt = {};
var argv = [];

exports = module.exports = function (_opt) {
  for(var p in _opt) {
    opt[p] = _opt[p];
  }
  return exports;
};

init.add(function (next) {
  var path = opt.path || undefined;

  var i =2;
  while(i < process.argv.length) {
    var arg = process.argv[i++];
    if (arg == '--config') {
      path = process.argv[i++];
    } else {
      argv.push(arg);
    }
  }

  if (!path) {
    return next(new Error('specify configuration path'));
  }

  console.log('config: ' + path);
  fs.readFile(path, 'utf8', function (err, data) {
    if (err) return next(err);
    var _config = JSON.parse(data);
    for(var p in _config) {
      exports[p] = _config[p];
    }
    next();
  });
});
