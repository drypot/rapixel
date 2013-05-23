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

var path1, path2, path3;

before(function () {
	path1 = upload.getTmpPath('f1.txt');
	path2 = upload.getTmpPath('f2.txt');
	path3 = upload.getTmpPath('f3.txt');
});

describe("tmpDeleter", function () {
	before(function (next) {
		fs2.makeDirs('tmp', 'upload-test', function (err) {
			fs.writeFile(path1, 'abc', function (err) {
				if (err) return next(err);
				fs.writeFile(path2, 'abc', function (err) {
					if (err) return next(err);
					fs.writeFile(path3, 'abc', function (err) {
						next(err);
					});
				});
			});
		});
	});
	it("should success", function (next) {
		fs.existsSync(path1).should.true;
		fs.existsSync(path2).should.true;
		fs.existsSync(path3).should.true;
		var files = [
			{ tname: 'f1.txt' },
			{ tname: 'f2.txt' }
		];
		var next2 = upload.tmpDeleter(files, function (err, param) {
			err.should.equal('errxx');
			param.should.equal('param1');
			fs.existsSync(path1).should.false;
			fs.existsSync(path2).should.false;
			fs.existsSync(path3).should.true;
			next();
		});
		next2('errxx', 'param1');
	});
});

