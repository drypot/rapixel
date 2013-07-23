
module.exports = UrlMaker;

function UrlMaker(baseUrl) {
	this.url = '' + baseUrl;
	this.qmAdded = false;
}

UrlMaker.prototype.add = function (name, value, def) {
	if (def !== undefined && def === value) {
		return this;
	}
	if (!this.qmAdded) {
		this.url += '?';
		this.qmAdded = true;
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
