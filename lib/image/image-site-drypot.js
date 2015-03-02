var exec = require('child_process').exec;

var error = require('../error/error');
var config = require('../config/config');
var imageb = require('../image/image-base');

exports.showListName = true;
exports.thumbnailSuffix = '-org.svg';
exports.svg = true;

exports.checkImageMeta = function (path, next) {
  imageb.identify(path, function (err, meta) {
    if (err) {
      return next(error(error.IMAGE_TYPE));
    }
    if (meta.format !== 'svg') {
      return next(error(error.IMAGE_TYPE));
    }
    next(null, meta);
  });
};

exports.makeVersions = function (org, meta, dir, id, next) {
  next(null, null);
};

exports.fillFields = function (image, form, meta, vers) {
  if (form) {
    image.comment = form.comment;
  }
};
