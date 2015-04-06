var chai = require('chai');
var expect = chai.expect;
chai.config.includeStack = true;

var init = require('../base/init');
var config = require('../base/config')({ path: 'config/test.json' });
var mdbp = require('../mongo/mongo')({ dropDatabase: true });

before(function (done) {
  init.run(done);
});

describe("db", function () {
  it("should have been opened.", function () {
    expect(mdbp.db.databaseName).equal(config.mongodb);
  });
});