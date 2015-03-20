var chai = require('chai');
var expect = chai.expect;
chai.config.includeStack = true;

var init = require('../base/init');
var config = require('../base/config')({ path: 'modules/base/config-fixture.json' });

describe("config with valid path", function () {
  it("should success", function (done) {
    init.run(function (err) {
      expect(err).not.exist;
      expect(config.appName).exist;
      expect(config.xxx).not.exist;
      done();
    });
  });
});

