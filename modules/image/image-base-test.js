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

describe("images collection", function () {
  it("should exist", function () {
    expect(imageb.images).exist;
  });
});

describe("newId", function () {
  it("should success", function () {
    var a = imageb.newId();
    var b = imageb.newId();
    expect(b).equal(a + 1);
  });
});

describe("ImagePath", function () {
  it("should success", function () {
    var dir = new imageb.ImagePath(1, 'jpeg');
    expect(dir.dir).equals('upload/rapixel-test/public/images/0/0/1');
    expect(dir.original).equals('upload/rapixel-test/public/images/0/0/1/1-org.jpeg');
    expect(dir.getVersion(640)).equals('upload/rapixel-test/public/images/0/0/1/1-640.jpg');
  });
});

describe("getUrlBase", function () {
  it("should success", function () {
    expect(imageb.getUrlBase(1)).equals('http://file.rapixel.local:8080/images/0/0/1');
  });
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
