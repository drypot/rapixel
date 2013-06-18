var exec = require('child_process').exec;

// TODO: magick wrapper 만들기

// identify -format "%m %w %h" samples/c-169-5120.jpg

exports.identify = function (fname, next) {
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

var _vers = [
	{ width:5120, height: 2880 },
	{ width:3840, height: 2160 },
	{ width:2880, height: 1620 },
	{ width:2560, height: 1440 },
	{ width:2048, height: 1152 },
	{ width:1920, height: 1080 },
	{ width:1680, height: 945 },
	{ width:1440, height: 810 },
	{ width:1366, height: 768 },
	{ width:1280, height: 720 },
	{ width:1136, height: 639 },
	{ width:1024, height: 576 },
	{ width:960 , height: 540 },
	{ width:640 , height: 360 }
];

exports.makeVersions = function (src, width, dir, id, next) {
	var cmd = 'convert ' + src;

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
		var dim = _vers[i];
		vers.push(dim.width);
		cmd += ' -resize ' + dim.width + 'x' + dim.height + '^'
		cmd += ' -crop ' + dim.width + 'x' + dim.height + '+0+0'
		cmd	+= ' +repage'
		if (i == _vers.length - 1) {
			cmd += ' ' + dir + '/' + id + '-' + dim.width + '.jpg'
		} else {
			cmd += ' -write ' + dir + '/' + id + '-' + dim.width + '.jpg'
		}
	}

	exec(cmd, function (err) {
		next(err, vers);
	});
};

//exports.makeVersions('samples/untracked/d-6000.jpg', 6000, 'tmp', 10, function (err, vers) {
//	console.log(err);
//	console.log(vers);
//	console.log('done');
//});