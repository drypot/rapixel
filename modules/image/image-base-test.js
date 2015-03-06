var should = require('should');

var init = require('../base/init');
var config = require('../config/config')({ path: 'config/rapixel-test.json' });
var imageb = require('../image/image-base');

before(function (done) {
  init.run(done);
});

describe("identify", function () {
  it("should fail with invalid path", function (done) {
    imageb.identify('xxxx', function (err, meta) {
      should(err);
      done();
    })
  });
  it("should fail with non image file", function (done) {
    imageb.identify('readme.md', function (err, meta) {
      should(err);
      done();
    })
  });
  it("should success with jpeg", function (done) {
    imageb.identify('samples/5120x2880-169.jpg', function (err, meta) {
      should(!err);
      meta.format.should.equal('jpeg');
      meta.width.should.equal(5120);
      meta.height.should.equal(2880);
      done();
    });
  });
  it("should success with svg", function (done) {
    imageb.identify('samples/svg-sample.svg', function (err, meta) {
      should(!err);
      meta.format.should.equal('svg');
      meta.width.should.equal(1000);
      meta.height.should.equal(1000);
      done();
    });
  });
});
