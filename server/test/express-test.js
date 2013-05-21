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

	app.get('/test/no-action', function (req, res, next) {
		next();
	});

	app.get('/test/send-hello', function (req, res) {
		res.send('hello');
	});

	app.get('/test/send-invalid-data', function (req, res) {
		res.jsonErr(error(error.INVALID_DATA));
	});

	app.get('/api/send-empty', function (req, res) {
		res.json({});
	});

	express.listen();

	next();
});

describe("no end point test", function () {
	it("should return not found", function (next) {
		express.get('/no-action', function (err, res) {
			should(!err);
			res.should.status(404);
			next();
		});
	});
});

describe("return text test", function () {
	it("should return 'hello'", function (next) {
		express.get('/test/send-hello', function (err, res) {
			should(!err);
			should(!res.error);
			res.text.should.equal('hello');
			next();
		});
	});
});

describe("return error test", function () {
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

describe("Cache-Control test", function () {
	describe("/test/send-hello", function () {
		it("should return private", function (next) {
			express.get('/test/send-hello', function (err, res) {
				should(!err);
				should(!res.error);
				res.get('Cache-Control').should.equal('private');
				next();
			});
		});
	});
	describe("/api/send-empty", function () {
		it("should return private", function (next) {
			express.get('/api/send-empty', function (err, res) {
				should(!err);
				should(!res.error);
				res.get('Cache-Control').should.equal('no-cache');
				next();
			});
		});
	});
});