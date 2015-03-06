var should = require('should');

var init = require('../base/init');
var config = require('../config/config')({ path: 'config/rapixel-test.json' });
var mongo = require('../mongo/mongo')({ dropDatabase: true });

before(function (done) {
  init.run(done);
});

describe("db", function () {
  it("should have been opened.", function () {
    mongo.db.databaseName.should.equal(config.mongoDb);
  });
});