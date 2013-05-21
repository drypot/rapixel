
function pad(number) {
	var r = String(number);
	if ( r.length === 1 ) {
		r = '0' + r;
	}
	return r;
}

exports.format = function (d) {
	return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' +
		pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
};
