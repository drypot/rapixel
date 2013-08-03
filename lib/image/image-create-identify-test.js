var should = require('should');

var init = require('../lang/init');
var config = require('../config/config')({ path: 'config/test.json' });
var fs2 = require('../fs/fs');
var imagel = require('../image/image');

before(function (next) {
	init.run(next);
});

before(function (next) {
	fs2.removeDirs('tmp/conv', function (err) {
		fs2.makeDirs('tmp/conv', function (err) {
			next(err)
		});
	});
});

describe("identify", function () {
	it("should fail with invalid path", function (next) {
		imagel.identify('xxxx', function (err, meta) {
			should(err);
			next();
		})
	});
	it("should fail with non image file", function (next) {
		imagel.identify('readme.md', function (err, meta) {
			should(err);
			next();
		})
	});
	it("should success with jpeg", function (next) {
		imagel.identify('samples/c-169-5120.jpg', function (err, meta) {
			should(!err);
			meta.format.should.equal('jpeg');
			meta.width.should.equal(5120);
			meta.height.should.equal(2880);
			next();
		});
	});
	it("should success with png", function (next) {
		imagel.identify('samples/c-169-5120.png', function (err, meta) {
			should(!err);
			meta.format.should.equal('png');
			meta.width.should.equal(5120);
			meta.height.should.equal(2880);
			next();
		});
	});
});
