var fs = require('fs');

exports.mkdirs = function () {
	var _args = arguments;
	var len = _args.length - 1;
	var next = _args[len];
	var path = null;
	var i = 0;
	function mkdir() {
		if (i == len) return next(null, path);
		var sub = _args[i++];
		path = !path ? sub : path + '/' + sub;
		fs.mkdir(path, 0755, function (err) {
			if (err && err.code !== 'EEXIST') return next(err);
			setImmediate(mkdir);
		});
	}
	mkdir();
};

exports.emptyDir = function (path, next) {
	fs.readdir(path, function (err, fnames) {
		if (err) return next(err);
		var i = 0;
		function unlink() {
			if (i == fnames.length) {
				return next();
			}
			var fname = fnames[i++];
			fs.unlink(path + '/' + fname, function (err) {
				setImmediate(unlink);
			});
		}
		unlink();
	});
};

exports.safeFilename = function (name) {
	var i = 0;
	var len = name.length;
	var safe = '';
	for (; i < len; i++) {
		var ch = name.charAt(i);
		var code = name.charCodeAt(i);
		if ((ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z') || (ch >= '0' && ch <= '9') || "`~!@#$%^&()-_+=[{]};',. ".indexOf(ch) >= 0)
			safe += ch;
		else if (code < 128)
			safe += '_';
		else
			safe += ch;
	}
	return safe;
};
