var chai = require('chai');
var assert2 = exports;

chai.use(require('chai-http'));
chai.config.includeStack = true;

assert2.expect = chai.expect;
assert2.chai = chai;
