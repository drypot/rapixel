
exports.defineMethod = function (con, methodName, fn) {
	Object.defineProperty(
		con, methodName, { value : fn, writable: true, enumerable: false, configurable: true}
	);
}

exports.find = function (a, fn) {
	for (var i = 0; i < a.length; i++) {
		var item = a[i];
		if (fn(item)) return item;
	}
	return null;
};

exports.merge = function () {
	var tar = arguments[0];
	var fn = arguments[arguments.length -1];
	for (var a = 1; a < arguments.length - 1; a++) {
		var src = arguments[a];
		sloop:
		for (var s = 0; s < src.length; s++) {
			for (var t = 0; t < tar.length; t++) {
				if (fn(tar[t], src[s])) continue sloop;
			}
			tar.push(src[s]);
		}
	}
}