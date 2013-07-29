var fs = require('fs');
var path = require('path');

var init = require('../lang/init');
var config = require('../config/config');
var fs2 = require('../fs/fs');

var tmpDir;

init.add(function (next) {
	console.log('upload: ' + config.data.uploadDir);

	tmpDir = config.data.uploadDir + '/tmp',
	fs2.makeDirs(tmpDir, function (err) {
		if (err) return next(err);
		fs2.emptyDir(tmpDir, next);
	});
});

exports.getTmpNames = function (req) {
	var tnames = {};
	for (var key in req.files) {
		var rfiles = req.files[key];
		if (!Array.isArray(rfiles)) {
			rfiles = [rfiles];
		}
		for (var i = 0; i < rfiles.length; i++) {
			var rfile = rfiles[i];
			if (/*rfile.size &&*/ rfile.name) {
				if (!files[key]) {
					tnames[key] = [];
				}
				tnames[key].push({
					oname: rfile.name,
					tname: path.basename(rfile.path)
				});
			}
		}
	}
	return tnames;
};

exports.getTmpPath = function (tname) {
	return tmpDir + '/' + tname;
}

exports.normalizeNames = function (tnames) {
	tnames = tnames || [];
	for (var i = 0; i < tnames.length; i++) {
		var tn = tnames[i];
		tn.oname = fs2.safeFilename(path.basename(tn.oname));
		tn.tname = path.basename(tn.tname);
		tn.tpath = exports.getTmpPath(tn.tname);
	}
	return tnames;
};

exports.deleteTmpFiles = function (tnames, next) {
	if (tnames) {
		var i = 0;
		function del() {
			if (i == tnames.length) return next();
			var tname = tnames[i++];
			fs.unlink(exports.getTmpPath(path.basename(tname)), function (err) {
				if (err && err.code !== 'ENOENT') return next(err);
				setImmediate(del);
			});
		}
		del();
	}
}

exports.tmpDeleter = function (tnames, next) {
	return function () {
		var _arg = arguments;
		if (!tnames) {
			return next.apply(null, _arg);
		}
		var i = 0;
		function unlink() {
			if (i == tnames.length) {
				return next.apply(null, _arg);
			}
			var tn = tnames[i++];
			fs.unlink(tn.tpath, function (err) {
				setImmediate(unlink);
			});
		}
		unlink();
	};
};
