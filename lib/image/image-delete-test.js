var should = require('should');
var fs = require('fs');

var init = require('../lang/init');
var error = require('../error/error');
var config = require('../config/config')({ path: 'config/test-rapixel.json' });
var mongo = require('../mongo/mongo')({ dropDatabase: true });
var upload = require('../upload/upload');
var imagel = require('../image/image');
var fs2 = require('../fs/fs');
var express = require('../express/express');

var userf = require('../user/user-fixture');

require('../main/session-api');
require('../image/image-api');
require('../upload/upload-api');

before(function (next) {
	init.run(next);
});

before(function (next) {
	fs2.removeDirs(upload.imageDir, next);
});

before(function () {
	express.listen();
});

var _f1 = 'samples/c-169-3840.jpg';
var _pid, _files;

describe("deleting by admin", function () {
	it("given user1 session", function (next) {
		userf.loginUser1(next);
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
	it("given image", function (next) {
		this.timeout(10000);
		var form = { files: _files, comment: 'hello' };
		express.post('/api/images').send(form).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			should(res.body.image._id);
			_pid = res.body.image._id;
			next();
		});
	});
	it("given admin session", function (next) {
		userf.loginAdmin(next);
	});
	it("should success", function (next) {
		var dir = imagel.getImageDir(_pid);
		var p = imagel.getVersionPath(dir, _pid, 3840);
		fs.existsSync(p).should.true;
		express.del('/api/images/' + _pid, function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			fs.existsSync(p).should.false;
			next();
		});
	});
});

describe("deleting image", function () {
	it("given user1 session", function (next) {
		userf.loginUser1(next);
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
	it("given image", function (next) {
		this.timeout(10000);
		var form = { files: _files, comment: 'hello' };
		express.post('/api/images').send(form).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			should(res.body.image._id);
			_pid = res.body.image._id;
			next();
		});
	});
	it("should success", function (next) {
		var dir = imagel.getImageDir(_pid);
		var p = imagel.getVersionPath(dir, _pid, 3840);
		fs.existsSync(p).should.true;
		express.del('/api/images/' + _pid, function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			fs.existsSync(p).should.false;
			next();
		});
	});
});

describe("deleting other's image", function () {
	it("given user1 session", function (next) {
		userf.loginUser1(next);
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
	it("given image", function (next) {
		this.timeout(10000);
		var form = { files: _files, comment: 'hello' };
		express.post('/api/images').send(form).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			should(res.body.image._id);
			_pid = res.body.image._id;
			next();
		});
	});
	it("given user2 session", function (next) {
		userf.loginUser2(next);
	});
	it("should fail", function (next) {
		var dir = imagel.getImageDir(_pid);
		var p = imagel.getVersionPath(dir, _pid, 3840);
		fs.existsSync(p).should.true;
		express.del('/api/images/' + _pid, function (err, res) {
			should(!err);
			should(!res.error);
			should(res.body.err);
			fs.existsSync(p).should.true;
			should(error.find(res.body.err, error.NOT_AUTHORIZED));
			next();
		});
	});
});
