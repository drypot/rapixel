var exec = require('child_process').exec;

var init = require('../lang/init');
var error = require('../error/error');
var fs2 = require('../fs/fs');
var config = require('../config/config');

var imageDir;
var imageUrl;

init.add(function () {
	error.define('IMAGE_NOT_EXIST', '파일이 없습니다.');
	error.define('IMAGE_CYCLE', 'files', '이미지는 하루 한 장 등록하실 수 있습니다.');
	error.define('IMAGE_NO_FILE', 'files', '아미지 파일이 첨부되지 않았습니다.');
	error.define('IMAGE_SIZE', 'files', '이미지의 가로, 세로 크기가 너무 작습니다.');
	error.define('IMAGE_TYPE', 'files', '인식할 수 없는 파일입니다.');
});

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
