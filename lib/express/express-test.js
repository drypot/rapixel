var should = require('should');

var init = require('../lang/init');
var config = require('../config/config')({ path: 'config/test.json' });
var express = require('../express/express');
var error = require('../error/error');
var ecode = require('../error/ecode');

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
		res.jsonErr(error(ecode.INVALID_DATA));
	});

	app.get('/api/send-empty', function (req, res) {
		res.json({});
	});

	app.get('/api/send-null', function (req, res) {
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
			should(res.body.err);
			should(error.find(res.body.err, ecode.INVALID_DATA));
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

describe("send-null test", function () {
	it("should success", function (next) {
		express.get('/api/send-null', function (err, res) {
			should(!err);
			should(!res.error);
			res.body.should.eql({});
			next();
		});
	});
});

describe("/api/hello", function () {
	it("should return 'hello'", function (next) {
		express.get('/api/hello', function (err, res) {
			should(!err);
			should(!res.error);
			res.should.be.json;
			res.body.name.should.equal(config.appName);
			var stime = parseInt(res.body.time || 0);
			var ctime = Date.now();
			should(stime <= ctime);
			should(stime >= ctime - 100);
			next();
		});
	});
});
