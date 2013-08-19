var should = require('should');

var init = require('../lang/init');
var error = require('../error/error');
var config = require('../config/config')({ path: 'config/test-rapixel.json' });
var express = require('../express/express');

before(function (next) {
	init.run(next);
});

before(function(next) {
	var app = express.app;

	app.get('/test/no-action', function (req, res, next) {
		next();
	});

	app.get('/test/plain-text', function (req, res) {
		res.send('some text');
	});

	app.get('/api/invalid-data', function (req, res) {
		res.jsonErr(error(error.ids.INVALID_DATA));
	});

	app.get('/api/json', function (req, res) {
		res.json({});
	});

	app.get('/api/null', function (req, res) {
		res.json(null);
	});

	app.get('/api/echo-query', function (req, res) {
		var obj = {};
		for(var p in req.query) {
			obj[p] = req.query[p];
		}
		res.json(obj);
	});

	express.listen();

	next();
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

describe("no-action", function () {
	it("should return not found", function (next) {
		express.get('/no-action', function (err, res) {
			should(!err);
			res.should.status(404);
			next();
		});
	});
});

describe("plain-text", function () {
	it("should return 'hello'", function (next) {
		express.get('/test/plain-text', function (err, res) {
			should(!err);
			should(!res.error);
			res.text.should.equal('some text');
			next();
		});
	});
});

describe("invalid-data", function () {
	it("should return code", function (next) {
		express.get('/api/invalid-data').end(function (err, res) {
			should(!err);
			should(!res.error);
			res.should.be.json;
			should(res.body.err);
			should(error.find(res.body.err, error.ids.INVALID_DATA));
			next();
		});
	});
});

describe("Cache-Control test", function () {
	describe("/test/hello", function () {
		it("should return private", function (next) {
			express.get('/test/plain-text', function (err, res) {
				should(!err);
				should(!res.error);
				res.get('Cache-Control').should.equal('private');
				next();
			});
		});
	});
	describe("/api/json", function () {
		it("should return private", function (next) {
			express.get('/api/json', function (err, res) {
				should(!err);
				should(!res.error);
				res.get('Cache-Control').should.equal('no-cache');
				next();
			});
		});
	});
});

describe("null", function () {
	it("should return {}", function (next) {
		express.get('/api/null', function (err, res) {
			should(!err);
			should(!res.error);
			res.body.should.eql({});
			next();
		});
	});
});

describe("echo-query-params", function () {
	it("should success", function (next) {
		express.get('/api/echo-query?p1&p2=123', function (err, res) {
			should(!err);
			should(!res.error);
			res.body.should.eql({
				p1: '',
				p2: '123'
			});
			next();
		});
	});
});

