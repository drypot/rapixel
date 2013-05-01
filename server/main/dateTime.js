
function pad(n) {
	var s = "0" + n;
	return s.substr(s.length - 2, 2);
}

exports.format = function (d) {
	return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
};
