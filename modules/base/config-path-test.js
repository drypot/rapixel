var should = require('should');

var init = require('../base/init');
var config = require('../base/config')({ path: 'modules/base/config-fixture.json' });

describe("config with valid path", function () {
  it("should success", function (done) {
    init.run(function (err) {
      should.not.exist(err);
      should.exist(config.appName);
      should.not.exist(config.xxx);
      done();
    });
  });
});

