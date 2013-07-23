var should = require('should');

var init = require('../main/init');
var config = require('../main/config')({ test: true });
var fs2 = require('../main/fs');
var photol = require('../main/photo');

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
		photol.identify('xxxx', function (err, meta) {
			should(err);
			next();
		})
	});
	it("should fail with non image file", function (next) {
		photol.identify('readme.md', function (err, meta) {
			should(err);
			next();
		})
	});
	it("should success with jpeg", function (next) {
		photol.identify('samples/c-169-5120.jpg', function (err, meta) {
			should(!err);
			meta.format.should.equal('jpeg');
			meta.width.should.equal(5120);
			meta.height.should.equal(2880);
			next();
		});
	});
	it("should success with png", function (next) {
		photol.identify('samples/c-169-5120.png', function (err, meta) {
			should(!err);
			meta.format.should.equal('png');
			meta.width.should.equal(5120);
			meta.height.should.equal(2880);
			next();
		});
	});
});
