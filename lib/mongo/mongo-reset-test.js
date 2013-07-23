var should = require('should');

var init = require('../main/init');
var config = require('../main/config')({ test: true });
var mongo = require('../main/mongo')({ dropDatabase: true });

before(function (next) {
	init.run(next);
});

describe("resets collection", function () {
	it("should exist", function () {
		should.exist(mongo.resets);
	});
});

describe("creating", function () {
	var _email = 'abc@def.com';
	var _id;
	it("should success", function (next) {
		var reset = {
			email: _email,
			token: 'xxx'
		};
		mongo.insertReset(reset, function (err, reset) {
			should(!err);
			should(reset);
			reset = reset[0];
			should(reset._id);
			should(reset.token);
			_id = reset._id;
			next();
		});
	});
	describe("check by reading", function () {
		it("should success", function (next) {
			mongo.findReset(_id, function (err, reset) {
				should(!err);
				should(reset);
				reset.email.should.equal(_email);
				next();
			});
		});
	});
});

