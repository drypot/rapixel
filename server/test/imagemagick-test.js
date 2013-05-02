var should = require('should');
var fs = require('fs');
var img = require('imagemagick');

before(function (next) {
	fs.mkdir('tmp', function (err) {
		fs.mkdir('tmp/conv', function (err) {
			fs.readdir('tmp/conv', function (err, files) {
				files.forEach(function (filename) {
					try {
						fs.unlinkSync('tmp/conv/' + filename);
					} catch (err) {
					}
				});
				next();
			});
		});
	});
});

describe("imagemagick jpeg", function () {

	it("can read meta", function (next) {
		img.readMetadata('samples/b-16x9-720.jpg', function (err, meta) {
			if (err) return next(err);
			should(meta.exif);
			//console.log(meta);
			next();
		})
	});
	it("can read features", function (next) {
		img.identify('samples/b-16x9-720.jpg', function (err, feats) {
			if (err) return next(err);
			//console.log(feats);
			feats.format.should.equal('JPEG');
			feats.quality.should.equal(0.87);
			feats.filesize.should.equal('364KB');
			feats.width.should.equal(1281);
			feats.height.should.equal(720);
			next();
		});
	});

});

describe("imagemagick png", function () {
	it("can read features", function (next) {
		img.identify('samples/b-16x9-720.png', function (err, feats) {
			if (err) return next(err);
			//console.log(feats);
			feats.format.should.equal('PNG');
			feats.filesize.should.equal('2.163MB');
			feats.width.should.equal(1281);
			feats.height.should.equal(720);
			next();
		});
	});
});

describe("resize", function () {
	it("should success png to jpeg", function (next) {
		var opt = {
			srcPath: 'samples/b-16x9-720.png',
			dstPath: 'tmp/conv/720-from-720-png.jpg',
			quality: 0.89,
			sharpening: 0,
			height: 720
		};
		img.resize(opt, function (err, stdout, stderr) {
			if (err) return next(err);
			next();
		});
	});
	it("should success jpeg to jpeg", function (next) {
		var opt = {
			srcPath: 'samples/b-16x9-720.jpg',
			dstPath: 'tmp/conv/720-from-720.jpg',
			quality: 0.92,
			sharpening: 0,
			height: 720
		};
		img.resize(opt, function (err, stdout, stderr) {
			if (err) return next(err);
			next();
		});
	});
	it("should success jpeg to jpeg", function (next) {
		var opt = {
			srcPath: 'samples/b-16x9-2760.jpg',
			dstPath: 'tmp/conv/1440-from-2760.jpg',
			quality: 0.92,
			sharpening: 0,
			height: 1440
		};
		img.resize(opt, function (err, stdout, stderr) {
			if (err) return next(err);
			next();
		});
	});
	it("should success jpeg to jpeg", function (next) {
		var opt = {
			srcPath: 'samples/b-16x9-1440.jpg',
			dstPath: 'tmp/conv/1440-from-1440.jpg',
			quality: 0.92,
			sharpening: 0,
			height: 1440
		};
		img.resize(opt, function (err, stdout, stderr) {
			if (err) return next(err);
			next();
		});
	});
});