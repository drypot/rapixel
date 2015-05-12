var fs = require('fs');
var minimist = require('minimist');

var init = require('../base/init');

var opt = {};
var argv = [];

var config = exports = module.exports = function (_opt) {
  for(var p in _opt) {
    opt[p] = _opt[p];
  }
  return config;
};

config.dev = process.env.NODE_ENV != 'production';

init.add(function (done) {
  config.argv = minimist(process.argv.slice(2));
  var path = opt.path || config.argv.config || config.argv.c;
  if (path) {
    console.log('config: ' + path);
    fs.readFile(path, 'utf8', function (err, data) {
      if (err) return done(err);
      var _config = JSON.parse(data);
      for(var p in _config) {
        config[p] = _config[p];
      }
      done();
    });
  } else {
    done();
  }
});
