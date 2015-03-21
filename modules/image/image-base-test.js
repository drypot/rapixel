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
  it("invalid path should fail", function (done) {
    imageb.identify('xxxx', function (err, meta) {
      expect(err).exist;
      done();
    })
  });
  it("non image should fail", function (done) {
    imageb.identify('README.md', function (err, meta) {
      expect(err).exist;
      done();
    })
  });
  it("jpeg should success", function (done) {
    imageb.identify('samples/5120x2880-169.jpg', function (err, meta) {
      expect(err).not.exist;
      expect(meta.format).equal('jpeg');
      expect(meta.width).equal(5120);
      expect(meta.height).equal(2880);
      done();
    });
  });
  it("svg should success", function (done) {
    imageb.identify('samples/svg-sample.svg', function (err, meta) {
      expect(err).not.exist;
      expect(meta.format).equal('svg');
      expect(meta.width).equal(1000);
      expect(meta.height).equal(1000);
      done();
    });
  });
});
