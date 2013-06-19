var should = require('should');
var fs = require('fs');

var init = require('../main/init');
var config = require('../main/config')({ test: true });
var mongo = require('../main/mongo')({ dropDatabase: true });
var upload = require('../main/upload');
var photol = require('../main/photo');
var fs2 = require('../main/fs');
var express = require('../main/express');
var error = require('../main/error');
var ecode = require('../main/ecode');
var ufix = require('../test/user-fixture');

require('../main/session-api');
require('../main/photo-api');
require('../main/upload-api');

before(function (next) {
	init.run(next);
});

before(function (next) {
	ufix.createFixtures(next);
});

before(function (next) {
	fs2.removeDirs(upload.photoDir, next);
});

before(function () {
	express.listen();
});

var _f1 = 'samples/c-169-3840.jpg';
var _pid, _files;

describe("deleting by admin", function () {
	it("given user1 session", function (next) {
		ufix.loginUser1(next);
	});
	it("given tmp file", function (next) {
		express.post('/api/upload').attach('files', _f1).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			_files = res.body.files;
			next();
		});
	});
	it("given photo", function (next) {
		this.timeout(10000);
		var form = { files: _files, comment: 'hello' };
		express.post('/api/photos').send(form).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			should(res.body.photo._id);
			_pid = res.body.photo._id;
			next();
		});
	});
	it("given admin session", function (next) {
		ufix.loginAdmin(next);
	});
	it("should success", function (next) {
		var dir = photol.getPhotoDir(_pid);
		var p = photol.getVersionPath(dir, _pid, 3840);
		fs.existsSync(p).should.true;
		express.del('/api/photos/' + _pid, function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			fs.existsSync(p).should.false;
			next();
		});
	});
});

describe("deleting photo", function () {
	it("given user1 session", function (next) {
		ufix.loginUser1(next);
	});
	it("given tmp file", function (next) {
		express.post('/api/upload').attach('files', _f1).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			_files = res.body.files;
			next();
		});
	});
	it("given photo", function (next) {
		this.timeout(10000);
		var form = { files: _files, comment: 'hello' };
		express.post('/api/photos').send(form).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			should(res.body.photo._id);
			_pid = res.body.photo._id;
			next();
		});
	});
	it("should success", function (next) {
		var dir = photol.getPhotoDir(_pid);
		var p = photol.getVersionPath(dir, _pid, 3840);
		fs.existsSync(p).should.true;
		express.del('/api/photos/' + _pid, function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			fs.existsSync(p).should.false;
			next();
		});
	});
});

describe("deleting other's photo", function () {
	it("given user1 session", function (next) {
		ufix.loginUser1(next);
	});
	it("given tmp file", function (next) {
		express.post('/api/upload').attach('files', _f1).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			_files = res.body.files;
			next();
		});
	});
	it("given photo", function (next) {
		this.timeout(10000);
		var form = { files: _files, comment: 'hello' };
		express.post('/api/photos').send(form).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			should(res.body.photo._id);
			_pid = res.body.photo._id;
			next();
		});
	});
	it("given user2 session", function (next) {
		ufix.loginUser2(next);
	});
	it("should fail", function (next) {
		var dir = photol.getPhotoDir(_pid);
		var p = photol.getVersionPath(dir, _pid, 3840);
		fs.existsSync(p).should.true;
		express.del('/api/photos/' + _pid, function (err, res) {
			should(!err);
			should(!res.error);
			should(res.body.err);
			fs.existsSync(p).should.true;
			should(error.find(res.body.err, ecode.NOT_AUTHORIZED));
			next();
		});
	});
});
