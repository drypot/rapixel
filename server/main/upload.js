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

	exports.getTmpFiles = function (req) {
		var files = {};
		for (var key in req.files) {
			var group = req.files[key];
			if (!Array.isArray(group)) {
				pushFile(files, key, group);
			} else {
				for (var i = 0; i < group.length; i++) {
					pushFile(files, key, group[i]);
				}
			}
		}
		return files;
	};

	function pushFile(files, key, file) {
		if (/*file.size &&*/ file.name) {
			if (!files[key]) {
				files[key] = [];
			}
			files[key].push({
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
				fs.unlink(exports.getTmpPath(path.basename(file.tname)), function (err) {
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
