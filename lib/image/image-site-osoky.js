var exec = require('child_process').exec;

var error = require('../error/error');
var config = require('../config/config');
var imageb = require('../image/image-base');

var _minWidth = 640;
var _minHeight = 640;

var _vers = [
	2880,
	2160,
	1800,
	1600,
	1536,
	1440,
	1080,
	900,
	800,
	768,
	720,
	640
];

exports.showListName = false;
exports.thumbnailSuffix = '-640.jpg';

exports.checkImageMeta = function (path, next) {
	imageb.identify(path, function (err, meta) {
		if (err) {
			return next(error(error.IMAGE_TYPE));
		}
		if (meta.shorter < 640) {
			return next(error(error.IMAGE_SIZE));
		}
		next(null, meta);
	});
};

exports.makeVersions = function (org, meta, dir, id, next) {
	var shorter = meta.shorter;
	var cmd = 'convert ' + org;
	cmd += ' -quality 92';
	cmd += ' -gravity center';
	cmd += ' -auto-orient';
	cmd += ' -crop ' + shorter + 'x' + shorter + '+0+0';
	cmd	+= ' +repage';

	var i = 0;
	var vers = [];
	var circled;
	for (; i < _vers.length; i++) {
		if (_vers[i] < shorter + 15) {
			break;
		}
	}
	for (; i < _vers.length; i++) {
		var ver = _vers[i];
		vers.push(ver);
		cmd += ' -resize ' + ver + 'x' + ver
		if (!circled) {
			var r = ver / 2;
			cmd += ' \\( -size ' + ver + 'x' + ver + ' xc:black -fill white -draw "circle ' + r + ',' + r + ',' + r + ',' + r * 20 / 320 + '" \\)'
			cmd += ' -alpha off -compose CopyOpacity -composite'
			cmd += ' \\( +clone -alpha opaque -fill white -colorize 100% \\)'
			cmd += ' +swap -geometry +0+0 -compose Over -composite -alpha off'
			//cmd += ' -background white -alpha remove -alpha off'; <-- IM 6.7.5 need for alpha remove
			circled = true;
		}
		if (i == _vers.length - 1) {
			cmd += ' ' + imageb.getVersionPath(dir, id, ver);
		} else {
			cmd += ' -write ' + imageb.getVersionPath(dir, id, ver);
		}
	}
	exec(cmd, function (err) {
		next(err, vers);
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

