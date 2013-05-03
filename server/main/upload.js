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

	fs2.mkdirs(config.data.uploadDir, 'public', function (err, dir) {
		if (err) return next(err);
		exports.pub = dir;
		fs2.mkdirs(config.data.uploadDir, 'public', 'photo', function (err, dir) {
			if (err) return next(err);
			fs2.mkdirs(config.data.uploadDir, 'tmp', function (err, dir) {
				if (err) return next(err);
				exports.tmp = dir;
				fs2.emptyDir(dir, next);
			});
		});
	});

});
