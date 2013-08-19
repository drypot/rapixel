var exec = require('child_process').exec;

var init = require('../lang/init');
var fs2 = require('../fs/fs');
var config = require('../config/config');

var imageDir;
var imageUrl;

init.add(function (next) {
	imageDir = config.uploadDir + '/public/images'
	imageUrl = config.uploadUrl + '/images';
	fs2.makeDirs(imageDir, next);
});

exports.getImageDir = function (id) {
	return fs2.makeDeepPath(imageDir, id, 3);
};

exports.getImageUrl = function (id) {
	return fs2.makeDeepPath(imageUrl, id, 3)
}

exports.getOriginalPath = function (dir, id, format) {
	return dir + '/' + id + '-org.' + format;
}

exports.getVersionPath = function (dir, id, width) {
	return dir + '/' + id + '-' + width + '.jpg';
};

exports.identify = function (fname, next) {
	exec('identify -format "%m %w %h" ' + fname, function (err, stdout, stderr) {
		if (err) return next(err);
		var a = stdout.split(/[ \n]/);
		var meta = {
			format: a[0].toLowerCase(),
			width: parseInt(a[1]) || 0,
			height: parseInt(a[2]) || 0
		};
		next(null, meta);
	});
};
