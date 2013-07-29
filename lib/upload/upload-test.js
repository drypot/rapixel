var should = require('should');
var fs = require('fs');

var init = require('../lang/init');
var config = require('../config/config')({ path: 'config/test.json' });
var fs2 = require('../fs/fs');
var upload = require('../upload/upload');

var base = 'tmp';

before(function (next) {
	init.run(next);
});

describe("deleting tmp files with tmpDeleter", function () {
	var path1, path2, path3;

	it("given tmp files", function (next) {
		path1 = upload.getTmpPath('f1.txt');
		path2 = upload.getTmpPath('f2.txt');
		path3 = upload.getTmpPath('f3.txt');
		fs2.makeDirs('tmp/upload-test', function (err) {
			fs.writeFileSync(path1, 'abc');
			fs.writeFileSync(path2, 'abc');
			fs.writeFileSync(path3, 'abc');
			next();	
		});
	});
	it("should success", function (next) {
		fs.existsSync(path1).should.true;
		fs.existsSync(path2).should.true;
		fs.existsSync(path3).should.true;
		next();
	});
	it("should success", function (next) {
		var files = [
			{ tpath: path1 },
			{ tpath: path2 }
		];
		var next2 = upload.tmpDeleter(files, function (err, param) {
			err.should.equal('errxx');
			param.should.equal('param1');
			next();
		});
		next2('errxx', 'param1');
	});
	it("should success", function (next) {
		fs.existsSync(path1).should.false;
		fs.existsSync(path2).should.false;
		fs.existsSync(path3).should.true;		
		next();
	});
});
