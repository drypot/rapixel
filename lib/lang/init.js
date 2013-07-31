var util = require('util');

var funcs = [];

process.on('uncaughtException', function (err) {
	console.error('UNCAUGHT EXCEPTION');
	if (err.stack) {
		console.error(err.stack);
	} else {
		console.error(util.inspect(err));
	}
});

exports.reset = function () {
	funcs = [];
}

exports.add = function (func) {
	if (func.length == 0) {
		funcs.push(function (next) {
			func();
			next();
		})
	} else {
		funcs.push(func);
	}
};

exports.run = function (next) {
	var i = 0;

	function run() {
		if (i == funcs.length) {
			funcs = [];
			return next();
		}
		var func = funcs[i++];
		func(function (err) {
			if (err) return next(err);
			setImmediate(run);
		});
	};

	run();
};
