var should = require('should');
var request = require('superagent').agent();

var init = require('../main/init');
var config = require('../main/config')({ test: true });
var mongo = require('../main/mongo')({ dropDatabase: true });
var upload = require('../main/upload');
var express = require('../main/express');
var error = require('../main/error');
var test = require('../main/test')({ request: request });

require('../main/photo-api');
require('../main/session-api');
require('../main/user-api');

before(function (next) {
	init.run(next);
});

before(function () {
	express.listen();
});

describe("prepare user", function () {
	it("should success", function (next) {
		test.createUser(next);
	});
	it("should success", function (next) {
		test.loginUser(next);
	});
});

describe("create photo", function () {
	it("should success", function (next) {
		var f1 = 'samples/b-16x9-720.jpg';
		var f2 = 'samples/b-16x9-1080.jpg';
		request.post(test.url + '/api/photos').attach('file', f1).attach('file', f2).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
});