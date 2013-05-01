var fs = require('fs');

exports.mkdirs = function (subs) {
	var dir = null;
	subs.forEach(function (sub) {
		if (!dir) {
			dir = sub;
		} else {
			dir += '/' + sub;
		}
		try {
			fs.mkdirSync(dir, 0755);
		} catch (err) {
			if (err.code !== 'EEXIST') throw err;
		}
	});
	return dir;
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
