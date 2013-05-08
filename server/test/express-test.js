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
	var app = express.app;

	app.get('/test', function (req, res) {
		res.send('test home');
	});

	app.get('/test/no-action', function (req, res, next) {
		next();
	});

	app.get('/test/send-invalid-data', function (req, res) {
		res.jsonErr(error(error.INVALID_DATA));
	});

	express.listen();

	next();
});

describe("/hello", function () {
	it("should return 'hello'", function (next) {
		express.get('/api/hello', function (err, res) {
			should(!err);
			should(!res.error);
			res.should.be.json;
			res.body.should.equal('hello');
			next();
		});
	});
});

describe("/test", function () {
	it("should return 'test home'", function (next) {
		express.get('/test', function (err, res) {
			should(!err);
			should(!res.error);
			res.text.should.equal('test home');
			next();
		});
	});
});

describe("/test/no-action", function () {
	it("should return not found", function (next) {
		express.get('/no-action', function (err, res) {
			should(!err);
			res.should.status(404);
			next();
		});
	});
});

describe("/test/send-invalid-data", function () {
	it("should return rc", function (next) {
		express.get('/test/send-invalid-data').end(function (err, res) {
			should(!err);
			should(!res.error);
			res.should.be.json;
			res.body.err.rc.should.equal(error.INVALID_DATA);
			res.body.err.message.should.equal(error.msg[error.INVALID_DATA]);
			should(res.body.err.stack);
			next();
		});
	});
});

