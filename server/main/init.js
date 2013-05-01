var funcs;

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

exports.reset = function () {
	funcs = [];
}

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
