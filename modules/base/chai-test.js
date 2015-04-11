var expect = require('../base/chai').expect;

describe('pathExist', function () {
  it('should success', function () {
    expect('modules/base/chai-test.js').pathExist;
    expect('modules/base/chai-etst-xx.js').not.pathExist;
  });
});