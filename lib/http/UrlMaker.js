
module.exports = UrlMaker;

function UrlMaker(baseUrl) {
	this.url = '' + baseUrl;
	this.qm = false;
}

UrlMaker.prototype.add = function (name, value, def) {
	if (def !== undefined && def === value) {
		return this;
	}
	if (!this.qm) {
		this.url += '?';
		this.qm = true;
	} else {
		this.url += '&';
	}
	this.url += name;
	this.url += '=';
	this.url += value;

	return this;
}

UrlMaker.prototype.toString = function () {
	return this.url;
}
