var should = require('should');
var fs = require('fs');

var init = require('../main/init');
var config = require('../main/config')({ test: true });
var fs2 = require('../main/fs');
var upload = require('../main/upload');

var base = 'tmp';

before(function (next) {
	init.run(next);
});

describe("tmpDeleter", function () {
	before(function (next) {
		fs2.makeDirs('tmp', 'upload-test', function (err) {
			fs.writeFile('tmp/upload-test/f1.txt', 'abc', function (err) {
				if (err) return next(err);
				fs.writeFile('tmp/upload-test/f2.txt', 'abc', function (err) {
					if (err) return next(err);
					fs.writeFile('tmp/upload-test/f3.txt', 'abc', function (err) {
						next(err);
					});
				});
			});
		});
	});
	it("should success", function (next) {
		fs.existsSync('tmp/upload-test/f1.txt').should.true;
		fs.existsSync('tmp/upload-test/f2.txt').should.true;
		fs.existsSync('tmp/upload-test/f3.txt').should.true;
		var files = [
			{ path: 'tmp/upload-test/f1.txt' },
			{ path: 'tmp/upload-test/f2.txt' }
		];
		var deleter = upload.tmpDeleter(files, function (err, param) {
			should(!err);
			param.should.equal('param1');
			fs.existsSync('tmp/upload-test/f1.txt').should.false;
			fs.existsSync('tmp/upload-test/f2.txt').should.false;
			fs.existsSync('tmp/upload-test/f3.txt').should.true;
			next();
		});
		deleter(null, 'param1');
	});
});

