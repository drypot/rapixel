var exec = require('child_process').exec;

var error = require('../base/error');
var config = require('../base/config');
var imageb = require('../image/image-base');

var _minWidth = 3840;
var _minHeight = 2160;

var _vers = [
  { width:5120, height: 2880 },
  { width:3840, height: 2160 },
  { width:2880, height: 1620 },
  { width:2560, height: 1440 },
  { width:2048, height: 1152 },
  { width:1920, height: 1080 },
  { width:1680, height: 945 },
  { width:1440, height: 810 },
  { width:1366, height: 768 },
  { width:1280, height: 720 },
  { width:1136, height: 640 },
  { width:1024, height: 576 },
  { width:960 , height: 540 },
  { width:640 , height: 360 }
];

exports.showListName = true;
exports.thumbnailSuffix = '-640.jpg';

exports.checkImageMeta = function (path, done) {
  imageb.identify(path, function (err, meta) {
    if (err) {
      return done(error('IMAGE_TYPE'));
    }
    if (meta.width < _minWidth - 15 || meta.height < _minHeight - 15 ) {
      return done(error('IMAGE_SIZE'));
    }
    done(null, meta);
  });
};

exports.makeVersions = function (dir, meta, done) {
  var cmd = 'convert ' + dir.original;
  cmd += ' -quality 92';
  cmd += ' -gravity center';

  var i = 0;
  var vers = [];
  for (; i < _vers.length; i++) {
    if (_vers[i].width < meta.width + (5120 - 3840) / 2) {
      break;
    }
  }
  for (; i < _vers.length; i++) {
    var ver = _vers[i];
    vers.push(ver.width);
    cmd += ' -resize ' + ver.width + 'x' + ver.height + '^' // '^' means these are minimum values.
    cmd += ' -crop ' + ver.width + 'x' + ver.height + '+0+0'
    cmd += ' +repage'
    if (i == _vers.length - 1) {
      cmd += ' ' + dir.getVersion(ver.width);
    } else {
      cmd += ' -write ' + dir.getVersion(ver.width);
    }
  }
  exec(cmd, function (err) {
    done(err, vers);
  });
};

exports.fillFields = function (image, form, meta, vers) {
  if (meta) {
    image.width = meta.width;
    image.height = meta.height;
  }
  if (vers) {
    image.vers = vers;
  }
  if (form) {
    image.comment = form.comment;
  }
};

