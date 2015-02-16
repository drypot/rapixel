var exec = require('child_process').exec;
var util = require('util');

var _vers = [
  { width:5120, height: 2880, postfix: '169'},
  { width:3840, height: 2160, postfix: '169' },
  { width:3840, height: 2400, postfix: '1610' },
  { width:2880, height: 1620, postfix: '169' },
  { width:1440, height: 810, postfix: '169' },
  { width:1280, height: 720, postfix: '169' },
  { width:1136, height: 640, postfix: '169' },
  { width:960 , height: 540, postfix: '169' },
  { width:640 , height: 360, postfix: '169' }
];

function makeVersions(next) {
  var i = 0;
  
  function make() {
    if (i == _vers.length) {
      return next();
    }
    var v = _vers[i++];
    var w = v.width;
    var h = v.height;
    var cmd = '';
    cmd += 'gm convert -size ' + w + 'x' + h + ' xc:#c0c0c0';
    cmd += ' -fill "#c0c0c0" -stroke "#303030" '
    cmd += ' -draw "circle ' + w / 2 + ', ' + h / 2 + ', ' + w / 2 + ', 0"';
    cmd += ' -draw "circle ' + w / 2 + ', ' + h / 2 + ', ' + w / 2 + ', ' + h / 4 + '"';
    cmd += ' -draw "line 0,0 ' + (w - 1) + ',' + (h - 1) + ' line 0,' + (h - 1) + ' ' + (w - 1) + ',0"';
    cmd += ' -quality 92 ' + w + 'x' + h + '-' + v.postfix + '.jpg';
    console.log(cmd);
    exec(cmd, function (err) {
      if (err) return next(err);
      setImmediate(make);
    })
  }
  
  make();
}

process.on('uncaughtException', function (err) {
  console.error('UNCAUGHT EXCEPTION');
  if (err.stack) {
    console.error(err.stack);
  } else {
    console.error(util.inspect(err));
  }
});

makeVersions(function (err) {
  console.log('done');
});
