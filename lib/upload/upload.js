var fs = require('fs');
var path = require('path');

var init = require('../lang/init');
var config = require('../config/config');
var fs2 = require('../fs/fs');

init.add(function (next) {

	console.log('upload: ' + config.data.uploadDir);

	exports.getTmpPath = function (tname) {
		return exports.tmpDir + '/' + tname;
	}

	exports.makeFiles = function (req) {
		var files = {};
		for (var key in req.files) {
			var tmpFiles = req.files[key];
			if (!Array.isArray(tmpFiles)) {
				tmpFiles = [tmpFiles];
			}
			for (var i = 0; i < tmpFiles.length; i++) {
				var tmpFile = tmpFiles[i];
				if (/*tmpFile.size &&*/ tmpFile.name) {
					if (!files[key]) {
						files[key] = [];
					}
					files[key].push({
						oname: tmpFile.name,
						tname: path.basename(tmpFile.path)
					});
				}
			}
		}
		return files;
	};

	exports.normalizeFiles = function (files) {
		files = files || [];
		for (var i = 0; i < files.length; i++) {
			var file = files[i];
			file.oname = fs2.safeFilename(path.basename(file.oname));
			file.tname = path.basename(file.tname);
			file.tpath = exports.getTmpPath(file.tname);
		}
		return files;
	};

	exports.deleteTmpFiles = function (files, next) {
		if (files) {
			var i = 0;
			function del() {
				if (i == files.length) return next();
				var file = files[i++];
				fs.unlink(exports.getTmpPath(path.basename(file)), function (err) {
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
			var i = 0;
			function unlink() {
				if (i == files.length) {
					return next.apply(null, _arg);
				}
				var file = files[i++];
				fs.unlink(file.tpath, function (err) {
					setImmediate(unlink);
				});
			}
			unlink();
		};
	};

	var pathes = [
		exports.tmpDir = config.data.uploadDir + '/tmp',
		exports.photoDir = config.data.uploadDir + '/public/photo'
	];

	var i = 0;
	function mkdir() {
		if (i == pathes.length) {
			fs2.emptyDir(exports.tmpDir, next);
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
