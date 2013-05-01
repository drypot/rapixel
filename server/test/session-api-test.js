var should = require('should');
var request = require('superagent').agent();

var init = require('../main/init');
var config = require('../main/config')({ test: true });
var mongo = require('../main/mongo')({ dropDatabase: true });
var express = require('../main/express');
var error = require('../main/error');
var test = require('../main/test')({ request: request });

require('../main/session-api');
require('../main/users-api');

before(function (next) {
	init.run(next);
});

before(function () {
	express.listen();
});

describe("login", function () {
	it("given snowman", function (next) {
		var form = { name: 'snowman', email: 'snowman@def.com', password: '1234' };
		request.post(test.url + '/api/users').send(form).end(function (err,res) {
			should(!res.body.err);
			next();
		});
	});
	it("should fail with invalid email", function (next) {
		var form = { email: 'snowboy@def.com', password: '1234' };
		request.post(test.url + '/api/session').send(form).end(function (err, res) {
			should(res.body.err);
		})
	});
});