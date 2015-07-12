var init = require('../base/init');
var config = require('../base/config')({ path: 'server/base/config-fixture.json' });
var expect = require('../base/assert').expect;

describe('config with valid path', function () {
  it('should success', function (done) {
    init.run(function (err) {
      expect(err).not.exist;
      expect(config.appName).exist;
      expect(config.xxx).not.exist;
      done();
    });
  });
});

