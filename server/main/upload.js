var fs = require('fs');
var path = require('path');

var init = require('../main/init');
var config = require('../main/config');
var fs2 = require('../main/fs');

init.add(function (next) {

	console.log('upload: ' + config.data.uploadDir);

	exports.tmpDeleter = function (files, next) {
		return function () {
			var _arg = arguments;
			if (!files) {
				return next.apply(null, _arg);
			}
			var i = 0;
			function unlink() {
				if (i == files.length) {
					return next.apply(null, _arg);
				}
				var file = files[i++];
				fs.unlink(file.path, function (err) {
					setImmediate(unlink);
				});
			}
			unlink();
		};
	};

	var pathes = [
		exports.pub = config.data.uploadDir + '/public',
		exports.pubPhoto = config.data.uploadDir + '/public/photo',
		exports.archive = config.data.uploadDir + '/archive',
		exports.archivePhoto = config.data.uploadDir + '/archive/photo',
		exports.tmp = config.data.uploadDir + '/tmp'
	];

	var i = 0;

	function mkdir() {
		if (i == pathes.length) {
			fs2.emptyDir(exports.tmp, next);
			return;
		}
		var p = pathes[i++];
		fs2.mkdirs(p, function (err) {
			if (err) return next(err);
			setImmediate(mkdir);
		})
	}

	mkdir();

});
