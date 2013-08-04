var should = require('should');

var init = require('../lang/init');
var config = require('../config/config')({ path: 'config/test.json' });
var mongo = require('../mongo/mongo')({ dropDatabase: true });

before(function (next) {
	init.run(next);
});

describe("db", function () {
	it("should have been opened.", function () {
		mongo.db.databaseName.should.equal(config.mongoDb);
	});
});