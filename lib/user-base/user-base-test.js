var should = require('should');

var init = require('../lang/init');
var config = require('../config/config')({ path: 'config/test.json' });
var mongo = require('../mongo/mongo')({ dropDatabase: true });
var userb = require('../user-base/user-base.js');

before(function (next) {
	init.run(next);
});

describe("users collection", function () {
	it("should exist", function () {
		should(mongo.users);
		should(mongo.users.find);
	});
});

describe("emailx", function () {
	it("should success", function () {
		userb.emailx.test("abc.def.com").should.false;
		userb.emailx.test("abc*xyz@def.com").should.false;
		userb.emailx.test("-a-b-c_d-e-f@def.com").should.true;
		userb.emailx.test("develop.bj@def.com").should.true;
	});
});
