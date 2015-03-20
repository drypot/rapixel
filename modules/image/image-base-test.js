var chai = require('chai');
var expect = chai.expect;
chai.use(require('chai-http'));
chai.config.includeStack = true;

var init = require('../base/init');
var config = require('../base/config')({ path: 'config/test.json' });
var imageb = require('../image/image-base');

before(function (done) {
  init.run(done);
});

describe("identify", function () {
  it("should fail with invalid path", function (done) {
    imageb.identify('xxxx', function (err, meta) {
      should.exist(err);
      done();
    })
  });
  it("should fail with non image file", function (done) {
    imageb.identify('readme.md', function (err, meta) {
      should.exist(err);
      done();
    })
  });
  it("should success with jpeg", function (done) {
    imageb.identify('samples/5120x2880-169.jpg', function (err, meta) {
      expect(err).not.exist;
      meta.format.should.equal('jpeg');
      meta.width.should.equal(5120);
      meta.height.should.equal(2880);
      done();
    });
  });
  it("should success with svg", function (done) {
    imageb.identify('samples/svg-sample.svg', function (err, meta) {
      expect(err).not.exist;
      meta.format.should.equal('svg');
      meta.width.should.equal(1000);
      meta.height.should.equal(1000);
      done();
    });
  });
});
