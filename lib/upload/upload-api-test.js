var should = require('should');
var fs = require('fs');

var lang = require('../lang/lang');
var init = require('../lang/init');
var config = require('../config/config')({ path: 'config/test.json' });
var mongo = require('../mongo/mongo')({ dropDatabase: true });
var express = require('../express/express');
var upload = require('../upload/upload');
var userf = require('../user/user-fixture');

require('../main/session-api');
require('../upload/upload-api');
require('../upload/upload-html');

function find(files, oname) {
	return lang.find(files, function (file) {
		return file.oname === oname;
	});
}

function exists(file) {
	fs.existsSync(upload.getTmpPath(file.tname)).should.be.true;
}

function nexists(file) {
	fs.existsSync(upload.getTmpPath(file.tname)).should.be.false;
}

before(function (next) {
	init.run(next);
});

before(function () {
	express.listen();
});

before(function (next) {
	userf.create(next);
});

it("given user session", function (next) {
	userf.loginUser1(next);
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

describe("uploading one file", function () {
	it("should success", function (next) {
		var f1 = 'server/test/fixture/dummy1.txt';
		express.post('/api/upload').attach('file', f1).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			should(res.body.file);
			exists(find(res.body.file, 'dummy1.txt'));
			next();
		});
	});
});

describe("uploading two files", function () {
	it("should success", function (next) {
		var f1 = 'server/test/fixture/dummy1.txt';
		var f2 = 'server/test/fixture/dummy2.txt';
		express.post('/api/upload').attach('file', f1).attach('file', f2).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			exists(find(res.body.file, 'dummy1.txt'));
			exists(find(res.body.file, 'dummy2.txt'));
			next();
		});
	});
});

describe("uploading two files to html", function () {
	it("should success", function (next) {
		var f1 = 'server/test/fixture/dummy1.txt';
		var f2 = 'server/test/fixture/dummy2.txt';
		express.post('/upload').attach('file', f1).attach('file', f2).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			res.should.be.html;
			var body = JSON.parse(res.text);
			exists(find(body.file, 'dummy1.txt'));
			exists(find(body.file, 'dummy2.txt'));
			next();
		});
	});
});

describe("deleting file", function () {
	var _files;
	it("given three uploaded files", function (next) {
		var f1 = 'server/test/fixture/dummy1.txt';
		var f2 = 'server/test/fixture/dummy2.txt';
		var f3 = 'server/test/fixture/dummy3.txt';
		express.post('/api/upload').attach('file', f1).attach('file', f2).attach('file', f3).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			_files = res.body.file;
			next();
		});
	});
	it("should success for dummy1.txt", function (next) {
		var files = [];
		var dummy1 = find(_files, 'dummy1.txt');
		exists(dummy1);
		files.push(dummy1.tname);
		express.del('/api/upload').send({ files: files }).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			nexists(dummy1);
			next();
		});
	});
	it("should success for dummy2.txt and dummy3.txt", function (next) {
		var files = [];
		var dummy2 = find(_files, 'dummy2.txt');
		var dummy3 = find(_files, 'dummy3.txt');
		exists(dummy2);
		exists(dummy3);
		files.push(dummy2.tname);
		files.push(dummy3.tname);
		express.del('/api/upload').send({ files: files }).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			nexists(dummy2);
			nexists(dummy3);
			next();
		});
	});
	it("should success for invalid file", function (next) {
		var files = [];
		var file = {
			oname: 'non-exist',
			tname: 'xxxxx-non-exist'
		};
		nexists(file);
		files.push(file.tname);
		express.del('/api/upload').send({ files: files }).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});

});
