var chai = require('chai');
var fs = require('fs');
var chaip = exports;

chai.use(require('chai-http'));
chai.config.includeStack = true;

chaip.expect = chai.expect;

chai.use(function (_chai, utils) {
  chai.Assertion.addProperty('pathExist', function () {
    this.assert(
      fs.existsSync(this._obj),
      "expected #{this} to exist",
      "expected #{this} not to exist"
    );
  });
});
