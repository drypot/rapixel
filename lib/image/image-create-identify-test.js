var should = require('should');

var init = require('../lang/init');
var config = require('../config/config')({ path: 'config/test.json' });
var mongo = require('../mongo/mongo')({ dropDatabase: true });
var imagec = require('../image/image-create');

before(function (next) {
	init.run(next);
});

describe("identify", function () {
	it("should fail with invalid path", function (next) {
		imagec.identify('xxxx', function (err, meta) {
			should(err);
			next();
		})
	});
	it("should fail with non image file", function (next) {
		imagec.identify('readme.md', function (err, meta) {
			should(err);
			next();
		})
	});
	it("should success with jpeg", function (next) {
		imagec.identify('samples/5120x2880-169.jpg', function (err, meta) {
			should(!err);
			meta.format.should.equal('jpeg');
			meta.width.should.equal(5120);
			meta.height.should.equal(2880);
			next();
		});
	});
});
