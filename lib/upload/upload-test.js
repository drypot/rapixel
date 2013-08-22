var should = require('should');
var fs = require('fs');

var lang = require('../lang/lang');
var init = require('../lang/init');
var fs2 = require('../fs/fs');
var config = require('../config/config')({ path: 'config/test-rapixel.json' });
var mongo = require('../mongo/mongo')({ dropDatabase: true });
var express = require('../express/express');
var usera = require('../user/user-auth');
var userf = require('../user/user-fixture');
var upload = require('../upload/upload');

function find(files, oname) {
	return lang.find(files, function (file) {
		return file.oname === oname;
	});
}

function touch(path) {
	fs.writeFileSync(path, '');
}

before(function (next) {
	init.run(next);
});

before(function () {
	express.listen();
});

before(function (next) {
	userf.loginUser1(next);
});

describe("deleter", function () {
	var _path1, _path2, _path3;

	it("given tmp files", function (next) {
		touch(_path1 = upload.getPath('f1.txt'));
		touch(_path2 = upload.getPath('f2.txt'));
		touch(_path3 = upload.getPath('f3.txt'));
		next();
	});
	it("check", function (next) {
		fs.existsSync(_path1).should.be.true;
		fs.existsSync(_path2).should.be.true;
		fs.existsSync(_path3).should.be.true;
		next();
	});
	it("should success", function (_next) {
		var files = [
			{ tpath: _path1 },
			{ tpath: _path2 }
		];
		var next = upload.deleter(files, function (err, param) {
			err.should.equal('errxx');
			param.should.equal('param1');
			_next();
		});
		next('errxx', 'param1');
	});
	it("check", function (next) {
		fs.existsSync(_path1).should.be.false;
		fs.existsSync(_path2).should.be.false;
		fs.existsSync(_path3).should.be.true;
		next();
	});
});

describe("uploading one file", function () {
	it("should success", function (next) {
		var f1 = 'lib/upload/fixture/f1.txt';
		express.post('/api/upload').attach('files', f1).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			should(res.body.files);
			var file;
			should(file = find(res.body.files, 'f1.txt'));
			fs.existsSync(upload.getPath(file.tname)).should.be.true;
			next();
		});
	});
});

describe("uploading two files", function () {
	it("should success", function (next) {
		var f1 = 'lib/upload/fixture/f1.txt';
		var f2 = 'lib/upload/fixture/f2.txt';
		express.post('/api/upload').attach('files', f1).attach('files', f2).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			var file;
			should(file = find(res.body.files, 'f1.txt'));
			fs.existsSync(upload.getPath(file.tname)).should.be.true;
			should(file = find(res.body.files, 'f2.txt'));
			fs.existsSync(upload.getPath(file.tname)).should.be.true;
			next();
		});
	});
});

describe("uploading two files to html", function () {
	it("should success", function (next) {
		var f1 = 'lib/upload/fixture/f1.txt';
		var f2 = 'lib/upload/fixture/f2.txt';
		express.post('/api/upload?rtype=html').attach('files', f1).attach('files', f2).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			res.should.be.html;
			res.body = JSON.parse(res.text);
			var file;
			should(file = find(res.body.files, 'f1.txt'));
			fs.existsSync(upload.getPath(file.tname)).should.be.true;
			should(file = find(res.body.files, 'f2.txt'));
			fs.existsSync(upload.getPath(file.tname)).should.be.true;
			next();
		});
	});
});

describe("uploading none", function () {
	it("should success", function (next) {
		express.post('/api/upload').end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			res.body.should.eql({});
			next();
		});
	});
});

describe("deleting files", function () {
	var _files;
	it("given three uploaded files", function (next) {
		var f1 = 'lib/upload/fixture/f1.txt';
		var f2 = 'lib/upload/fixture/f2.txt';
		var f3 = 'lib/upload/fixture/f3.txt';
		express.post('/api/upload').attach('files', f1).attach('files', f2).attach('files', f3).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			_files = res.body.files;
			for (var i = 0; i < _files.length; i++) {
				_files[i].tpath = upload.getPath(_files[i].tname);
			};
			next();
		});
	});
	it("should success for f1.txt", function (next) {
		var f1;
		should(f1 = find(_files, 'f1.txt'))
		fs.existsSync(f1.tpath).should.be.true;
		express.del('/api/upload').send({ files: [ f1.tname ] }).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			fs.existsSync(f1.tpath).should.be.false;
			next();
		});
	});
	it("should success for f2.txt and f3.txt", function (next) {
		var f2, f3;
		should(f2 = find(_files, 'f2.txt'))
		fs.existsSync(f2.tpath).should.be.true;
		should(f3 = find(_files, 'f3.txt'))
		fs.existsSync(f3.tpath).should.be.true;
		express.del('/api/upload').send({ files: [ f2.tname, f3.tname ] }).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			fs.existsSync(f2.tpath).should.be.false;
			fs.existsSync(f3.tpath).should.be.false;
			next();
		});
	});
	it("should success for invalid file", function (next) {
		express.del('/api/upload').send({ files: [ 'no-file.txt' ] }).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
});

