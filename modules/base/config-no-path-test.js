var chai = require('chai');
var expect = chai.expect;
chai.config.includeStack = true;

var init = require('../base/init');
var config = require('../base/config');

describe("config with invalid path", function () {
  it("should fail", function (done) {
    init.run(function (err) {
      expect(err).exist;
      expect(err.message).equal('specify configuration path');
      done();
    });
  });
});
