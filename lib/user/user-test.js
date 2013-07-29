var should = require('should');

var init = require('../lang/init');
var config = require('../config/config')({ path: 'config/test.json' });
var mongo = require('../mongo/mongo')({ dropDatabase: true });
var u = require('../user/user.js');

before(function (next) {
	init.run(next);
});

describe("users collection", function () {
	it("should exist", function () {
		should(u.users);
		should(u.users.find);
	});
});
