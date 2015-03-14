var should = require('should');

var init = require('../base/init');
var config = require('../base/config');

describe("config with invalid path", function () {
  it("should fail", function (done) {
    init.run(function (err) {
      should.exist(err);
      err.message.should.equal('specify configuration path');
      done();
    });
  });
});
