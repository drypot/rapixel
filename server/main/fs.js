var fs = require('fs');
var path = require('path');

exports.makeDirs = function () {
	var next = arguments[arguments.length - 1];
	var subs = arguments;
	var p = null;
	var i = 0;
	function mkdir() {
		if (i == subs.length - 1) {
			return next(null, p);
		}
		var sub = subs[i++];
		if (Array.isArray(sub)) {
			makeDirsArray(p, sub, function (err, _path) {
				if (err) return next(err);
				p = _path;
				setImmediate(mkdir);
			});
			return;
		}
		p = !p ? sub : p + '/' + sub;
		makeDirsString(p, function (err) {
			if (err) return next(err);
			setImmediate(mkdir);
		});
	}
	mkdir();
};

// 불필요한 클로저가 생기는 것을 막기 위해 밖으로 뽑았다.
function makeDirsArray(p, ary, next) {
	var i = 0;
	function mkdir() {
		if (i == ary.length) {
			return next(null, p);
		}
		var sub = ary[i++];
		p = !p ? sub : p + '/' + sub;
		fs.mkdir(p, 0755, function (err) {
			if (err && err.code !== 'EEXIST') return next(err);
			setImmediate(mkdir);
		});
	}
	mkdir();
}

function makeDirsString(p, next) {
	fs.mkdir(p, 0755, function(err) {
		if (err && err.code === 'ENOENT') {
			makeDirsString(path.dirname(p), function (err) {
				if (err) return next(err);
				fs.mkdir(p, 0755, function(err) {
					if (err && err.code !== 'EEXIST') return next(err);
					next();
				});
			});
			return;
		}
		if (err && err.code !== 'EEXIST') {
			return next(err);
		}
		next();
	});
}

exports.removeDirs = function removeDirs(p, next) {
	fs.stat(p, function (err, stat) {
		if (err) return next(err);
		if(stat.isFile()) {
			fs.unlink(p, function (err) {
				if (err && err.code !== 'ENOENT') return next(err);
				next();
			});
			return;
		}
		if(stat.isDirectory()) {
			fs.readdir(p, function (err, fnames) {
				if (err) return next(err);
				var i = 0;
				function unlink() {
					if (i == fnames.length) {
						fs.rmdir(p, function (err) {
							if (err && err.code !== 'ENOENT') return next(err);
							next();
						});
						return;
					}
					var fname = fnames[i++];
					removeDirs(p + '/' + fname, function (err) {
						if (err) return next(err);
						setImmediate(unlink);
					});
				}
				unlink();
			});
		}
	});
};

exports.emptyDir = function (p, next) {
	fs.readdir(p, function (err, fnames) {
		if (err) return next(err);
		var i = 0;
		function unlink() {
			if (i == fnames.length) {
				return next();
			}
			var fname = fnames[i++];
			exports.removeDirs(p + '/' + fname, function (err) {
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
