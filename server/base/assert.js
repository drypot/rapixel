var chai = require('chai');
var assertp = exports;

chai.use(require('chai-http'));
chai.config.includeStack = true;

assertp.expect = chai.expect;
assertp.chai = chai;
