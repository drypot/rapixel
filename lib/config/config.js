var fs = require('fs');

var init = require('../lang/init');

var opt = {};
var argv = [];

exports = module.exports = function (_opt) {
	for(var p in _opt) {
		opt[p] = _opt[p];
	}

	if (_opt.path) {
		argv.push(_opt.path);
	}

	return exports;
};

init.add(function (next) {
	for (var i = 2; i < process.argv.length; i++) {
		var arg = process.argv[i];
		if (~arg.indexOf('--')) {
			//
		} else {
			argv.push(arg);
		}
	}

	var path = argv[0];

	if (!path) {
		return next(new Error('specify configuration path.'));
	}

	fs.readFile(path, 'utf8', function (err, data) {
		if (err) return next(err);
		console.log('config: ' + path);
		exports.data = JSON.parse(data);
		next();
	});
});
