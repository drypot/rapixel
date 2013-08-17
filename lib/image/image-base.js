var exec = require('child_process').exec;

var init = require('../lang/init');
var fs2 = require('../fs/fs');
var config = require('../config/config');

var imageb = exports;

init.add(function (next) {
	imageb.imageDir = config.uploadDir + '/public/images'
	imageb.imageUrl = config.uploadUrl + '/images';
	fs2.makeDirs(imageb.imageDir, next);
});

imageb.getImageDir = function (id) {
	return fs2.makeDeepPath(imageb.imageDir, id, 3);
};

imageb.getOriginalPath = function (dir, id, format) {
	return dir + '/' + id + '-org.' + format;
}

imageb.getVersionPath = function (dir, id, width) {
	return dir + '/' + id + '-' + width + '.jpg';
};

imageb.identify = function (fname, next) {
	exec('identify -format "%m %w %h" ' + fname, function (err, stdout, stderr) {
		if (err) return next(err);
		var a = stdout.split(/[ \n]/);
		var meta = {
			format: a[0].toLowerCase(),
			width: parseInt(a[1]) || 0,
			height: parseInt(a[2]) || 0
		};
		next(null, meta);
	});
};

imageb.makeVersions = function (org, width, dir, id, _vers, next) {
	var cmd = 'convert ' + org;
	cmd += ' -quality 92';
	cmd += ' -gravity center';

	var i = 0;
	var vers = [];
	for (; i < _vers.length; i++) {
		if (_vers[i].width < width + 15) {
			break;
		}
	}
	for (; i < _vers.length; i++) {
		var ver = _vers[i];
		vers.push(ver.width);
		cmd += ' -resize ' + ver.width + 'x' + ver.height + '^' // '^' means these are minimum values.
		cmd += ' -crop ' + ver.width + 'x' + ver.height + '+0+0'
		cmd	+= ' +repage'
		if (i == _vers.length - 1) {
			cmd += ' ' + imageb.getVersionPath(dir, id, ver.width);
		} else {
			cmd += ' -write ' + imageb.getVersionPath(dir, id, ver.width);
		}
	}
	exec(cmd, function (err) {
		next(err, vers);
	});
};
