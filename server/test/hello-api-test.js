var should = require('should');

var init = require('../main/init');
var config = require('../main/config')({ test: true });
var express = require('../main/express');
var error = require('../main/error');

require('../main/hello-api');

before(function (next) {
	init.run(next);
});

before(function(next) {
	express.listen();
	next();
});

describe("/api/hello", function () {
	it("should return 'hello'", function (next) {
		express.get('/api/hello', function (err, res) {
			should(!err);
			should(!res.error);
			res.should.be.json;
			res.body.name.should.equal(config.data.appName);
			var stime = parseInt(res.body.time || 0);
			var ctime = Date.now();
			should(stime <= ctime);
			should(stime >= ctime - 100);
			next();
		});
	});
});