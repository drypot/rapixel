var exec = require('child_process').exec;

var error = require('../base/error');
var config = require('../base/config');
var imageb = require('../image/image-base');

exports.thumbnailSuffix = '-org.svg';
exports.svg = true;

exports.checkImageMeta = function (path, done) {
  imageb.identify(path, function (err, meta) {
    if (err) {
      return done(error('IMAGE_TYPE'));
    }
    if (meta.format !== 'svg') {
      return done(error('IMAGE_TYPE'));
    }
    done(null, meta);
  });
};

exports.saveImage = function (dir, meta, done) {
  done(null, null);
};

exports.fillImageDoc = function (image, form, meta, vers) {
  if (form) {
    image.comment = form.comment;
  }
};

