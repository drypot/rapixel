var fs = require('fs');

var init = require('../lang/init');

exports = module.exports = function (_opt) {
	var opt = exports.opt = {};
	var argv = exports.argv = [];

	for(var p in _opt) {
		opt[p] = _opt[p];
	}

	if (_opt.path) {
		argv.push(_opt.path);
	}

	for (var i = 2; i < process.argv.length; i++) {
		var arg = process.argv[i];
		if (~arg.indexOf('--')) {
			//
		} else {
			argv.push(arg);
		}
	}

	return exports;
};

init.add(function (next) {
	var path = exports.argv[0];

	if (!path) {
		return next(new Error('specify configuration path.'));
	}

	fs.readFile(path, 'utf8', function (err, data) {
		if (err) return next(err);
		console.log('config: opened ' + path);
		exports.data = JSON.parse(data);
		next();
	});
});
