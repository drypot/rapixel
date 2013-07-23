
process.on('uncaughtException', function (err) {
	console.error('UNCAUGHT EXCEPTION');
	if (err.stack) {
		console.error(err.stack);
	} else {
		console.log(require('util').inspect(err));
	}
});

var funcs;

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
	console.log('init:');

	var i = 0;
	var len = funcs.length;

	(function run() {
		if (i == len) return next();
		var func = funcs[i++];
		func(function (err) {
			if (err) return next(err);
			setImmediate(run);
		});
	})();
};

exports.reset();
