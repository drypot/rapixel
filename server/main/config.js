var fs = require('fs');

var init = require('../main/init');

var opt = {};

exports = module.exports = function (_opt) {
	if (_opt.reset) {
		opt = {};
		delete exports.data;
	}
	if (_opt.parseArgv) {
		for (var i = 2; i < process.argv.length; i++) {
			var arg = process.argv[i];
			if (arg.indexOf('--') === 0) {
				//
			} else {
				_opt.path = arg;
			}
		}
	}
	if (_opt.test) {
		_opt.path = 'config/config-test.json';
	}
	for(var p in _opt) {
		opt[p] = _opt[p];
	}
	return exports;
};

init.add(function (next) {

	if (!opt.path) {
		return next(new Error('specify configuration path.'));
	}

	console.log('config: ' + opt.path);

	try {
		exports.data =  JSON.parse(fs.readFileSync(opt.path, 'utf8'));
		next();
	} catch (err) {
		next(err);
	}

});
