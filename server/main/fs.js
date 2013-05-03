var fs = require('fs');

exports.mkdirs = function () {
	var next = arguments[arguments.length - 1];
	var subs = [];
	for (var j = 0; j < arguments.length - 1; j++) {
		var arg = arguments[j];
		if (Array.isArray(arg)) {
			for (var k = 0; k < arg.length; k++) {
				subs.push(arg[k]);
			}
		} else {
			subs.push(arg);
		}
	}
	var path = null;
	var i = 0;
	function mkdir() {
		if (i == subs.length) {
			return next(null, path);
		}
		var sub = subs[i++];
		path = !path ? sub : path + '/' + sub;
		fs.mkdir(path, 0755, function (err) {
			if (err && err.code !== 'EEXIST') return next(err);
			setImmediate(mkdir);
		});
	}
	mkdir();
};

exports.rmAll = function rmAll(path, next) {
	fs.stat(path, function (err, stat) {
		if (err) return next(err);
		if(stat.isFile()) {
			fs.unlink(path, function (err) {
				if (err && err.code !== 'ENOENT') return next(err);
				next();
			});
			return;
		}
		if(stat.isDirectory()) {
			fs.readdir(path, function (err, fnames) {
				if (err) return next(err);
				var i = 0;
				function unlink() {
					if (i == fnames.length) {
						fs.rmdir(path, function (err) {
							if (err && err.code !== 'ENOENT') return next(err);
							next();
						});
						return;
					}
					var fname = fnames[i++];
					rmAll(path + '/' + fname, function (err) {
						if (err) return next(err);
						setImmediate(unlink);
					});
				}
				unlink();
			});
		}
	});
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
			exports.rmAll(path + '/' + fname, function (err) {
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

exports.subs = function (id, iter) {
	var path = [];
	for (iter--; iter > 0; iter--) {
		path.unshift(id % 1000);
		id = Math.floor(id / 1000);
	}
	path.unshift(id);
	return path;
}
