var init = require('../base/init');
var config = require('../base/config')({ path: 'config/test.json' });
var imageb = require('../image/image-base');
var expect = require('../base/assert').expect;

before(function (done) {
  init.run(done);
});

describe('images', function () {
  it('should exist', function () {
    expect(imageb.images).exist;
  });
  it('getNewId should success', function () {
    expect(imageb.getNewId() < imageb.getNewId()).true;
  });
});

describe('FilePath', function () {
  it('should success', function () {
    var path = new imageb.FilePath(1, 'jpeg');
    expect(path.dir).equals(config.uploadDir + '/public/images/0/0/1');
    expect(path.original).equals(config.uploadDir + '/public/images/0/0/1/1-org.jpeg');
    expect(path.getVersion(640)).equals(config.uploadDir + '/public/images/0/0/1/1-640.jpg');
  });
});

describe('getUrlBase', function () {
  it('should success', function () {
    expect(imageb.getUrlBase(1)).equals(config.uploadSite + '/images/0/0/1');
  });
});

describe('identify', function () {
  it('invalid path should fail', function (done) {
    imageb.identify('xxxx', function (err, meta) {
      expect(err).exist;
      done();
    })
  });
  it('non image should fail', function (done) {
    imageb.identify('README.md', function (err, meta) {
      expect(err).exist;
      done();
    })
  });
  it('jpeg should success', function (done) {
    imageb.identify('samples/5120x2880-169.jpg', function (err, meta) {
      expect(err).not.exist;
      expect(meta.format).equal('jpeg');
      expect(meta.width).equal(5120);
      expect(meta.height).equal(2880);
      done();
    });
  });
  it('svg should success', function (done) {
    imageb.identify('samples/svg-sample.svg', function (err, meta) {
      expect(err).not.exist;
      expect(meta.format).equal('svg');
      expect(meta.width).equal(1000);
      expect(meta.height).equal(1000);
      done();
    });
  });
});
