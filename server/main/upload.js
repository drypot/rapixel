var fs = require('fs');
var path = require('path');

var init = require('../main/init');
var config = require('../main/config');
var fs2 = require('../main/fs');

init.add(function (next) {

	console.log('upload: ' + config.data.uploadDir);

	exports.getTmpPath = function (fname) {
		return exports.tmp + '/' + fname;
	}

	exports.getTmpFiles = function (_files) {
		var files = [];
		if (_files) {
			if (!Array.isArray(_files)) {
				pushFile(files, _files);
			} else {
				for (var i = 0; i < _files.length; i++) {
					pushFile(files, _files[i]);
				}
			}
		}
		return files;
	};

	function pushFile(files, file) {
		if (/*file.size &&*/ file.name) {
			files.push({
				oname: file.name,
				tname: path.basename(file.path)
			});
		}
	}

	exports.deleteTmpFiles = function (files, next) {
		if (files) {
			var i = 0;
			function del() {
				if (i == files.length) return next();
				var file = files[i++];
				fs.unlink(exports.getTmpPath(path.basename(file.tname)), function (err) {
					if (err && err.code !== 'ENOENT') return next(err);
					setImmediate(del);
				});
			}
			del();
		}
	}

	exports.tmpDeleter = function (files, next) {
		return function () {
			var _arg = arguments;
			if (!files) {
				return next.apply(null, _arg);
			}
			if (!files.length) {
				files = [files];
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
		exports.tmp = config.data.uploadDir + '/tmp',
		exports.pub = config.data.uploadDir + '/public',
		exports.pubPhoto = config.data.uploadDir + '/public/photo'
	];

	var i = 0;
	function mkdir() {
		if (i == pathes.length) {
			fs2.emptyDir(exports.tmp, next);
			return;
		}
		var p = pathes[i++];
		fs2.makeDirs(p, function (err) {
			if (err) return next(err);
			setImmediate(mkdir);
		})
	}
	mkdir();

});
