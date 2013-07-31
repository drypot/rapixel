var should = require('should');
var fs = require('fs');

var init = require('../lang/init');
var config = require('../config/config')({ path: 'config/test.json' });
var mongo = require('../mongo/mongo')({ dropDatabase: true });
var express = require('../express/express');
var photol = require('../photo/photo');
var error = require('../error/error');
var ecode = require('../error/ecode');
var userfix = require('../user/user-fixture');

require('../main/session-api');
require('../photo/photo-api');
require('../upload/upload-api');

before(function (next) {
	init.run(next);
});

before(function (next) {
	userfix.create(next);
});

before(function () {
	express.listen();
});

before(function (next) {
	userfix.loginUser1(next);
});

describe("uploading photo within cycle", function () {
	it("given photo uploaded 3 hour ago", function (next){
		var photo = {
			_id: mongo.newPhotoId(),
			uid: userfix.user1._id,
			cdate: new Date(Date.now() - (3 * 60 * 60 * 1000))
		};
		mongo.insertPhoto(photo, next);
	});
	it("should return PHOTO_CYCLE error", function (next) {
		var form = { files: [{ oname: 'dummy.jpg', tname: 'xxxxx' }] };
		express.post('/api/photos').send(form).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, ecode.PHOTO_CYCLE));
			next();
		});
	});
});

describe("uploading no file", function () {
	it("given emtpy photos", function (next) {
		mongo.photos.remove(next);
	});
	it("should fail", function (next) {
		var form = { files: null };
		express.post('/api/photos').send(form).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, ecode.PHOTO_NO_FILE));
			next();
		});
	});
});

describe("uploading small", function () {
	var _f1 = 'samples/c-169-2560.jpg';
	var _files;
	it("given tmp file", function (next) {
		express.post('/api/upload').attach('files', _f1).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			_files = res.body.files;
			next();
		});
	});
	it("should fail", function (next) {
		var form = { files: _files };
		express.post('/api/photos').send(form).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, ecode.PHOTO_SIZE));
			next();
		});
	});
});

describe("uploading text file", function () {
	var _f1 = 'server/test/fixture/dummy1.txt';
	var _files;
	it("given tmp file", function (next) {
		express.post('/api/upload').attach('files', _f1).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			_files = res.body.files;
			next();
		});
	});
	it("should fail", function (next) {
		var form = { files: _files };
		express.post('/api/photos').send(form).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, ecode.PHOTO_TYPE));
			next();
		});
	});
});

describe("uploading 3840 jpg", function () {
	var _f1 = 'samples/c-169-3840.jpg';
	var _pid;
	var _files;
	it("given tmp file", function (next) {
		express.post('/api/upload').attach('files', _f1).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			_files = res.body.files;
			next();
		});
	});
	it("should success", function (next) {
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
	it("can be confirmed", function (next) {
		express.get('/api/photos/' + _pid).end(function (err, res) {
			should(!res.error);
			should(!res.body.err);
			res.body._id.should.equal(_pid);
			res.body.user._id.should.equal(userfix.user1._id);
			res.body.fname.should.equal('c-169-3840.jpg');
			res.body.format.should.equal('jpeg');
			res.body.width.should.equal(3840);
			res.body.vers.should.eql([ 3840, 2880, 2560, 2048, 1920, 1680, 1440, 1366, 1280, 1136, 1024, 960, 640 ]);
			should(res.body.cdate);
			res.body.comment.should.equal('hello');
			var dir = photol.getPhotoDir(_pid);
			fs.existsSync(photol.getVersionPath(dir, _pid, 3840)).should.be.true;
			fs.existsSync(photol.getVersionPath(dir, _pid, 1280)).should.be.true;
			fs.existsSync(photol.getVersionPath(dir, _pid, 640)).should.be.true;
			next();
		});
	});
});

