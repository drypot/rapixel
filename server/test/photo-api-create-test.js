var should = require('should');
var fs = require('fs');

var init = require('../main/init');
var config = require('../main/config')({ test: true });
var mongo = require('../main/mongo')({ dropDatabase: true });
var upload = require('../main/upload');
var express = require('../main/express');
var photo = require('../main/photo');
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

before(function () {
	express.listen();
});

before(function (next) {
	ufix.loginUser1(next);
});

describe("uploading photo within cycle", function () {
	it("given photo uploaded 3 hour ago", function (next){
		var ph = {
			_id: mongo.newPhotoId(),
			uid: ufix.user1._id,
			cdate: new Date(Date.now() - (3 * 60 * 60 * 1000))
		};
		mongo.insertPhoto(ph, next);
	});
	it("should return PHOTO_CYCLE error", function (next) {
		var form = { files: [{ oname: 'dummy.jpg', tname: 'xxxxx' }] };
		express.post('/api/photos').send(form).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, ecode.fields.PHOTO_CYCLE));
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
			should(error.find(res.body.err, ecode.fields.PHOTO_NO_FILE));
			next();
		});
	});
});

describe("uploading two file", function () {
	var _f1 = 'samples/b-16x9-1080.jpg';
	var _f2 = 'samples/b-16x9-720.jpg';
	var _files;
	it("given two tmp files", function (next) {
		express.post('/api/upload').attach('files', _f1).attach('files', _f2).end(function (err, res) {
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
			should(error.find(res.body.err, ecode.fields.PHOTO_NOT_ONE));
			next();
		});
	});
});

describe("uploading 1440 jpg", function () {
	var _f1 = 'samples/b-16x9-1440.jpg';
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
			should(error.find(res.body.err, ecode.fields.PHOTO_HEIGHT));
			next();
		});
	});
});

describe("uploading 16:10 jpg", function () {
	var _f1 = 'samples/b-16x10-2160.jpg';
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
			should(error.find(res.body.err, ecode.fields.PHOTO_RATIO));
			next();
		});
	});
});

describe("uploading 617 jpg", function () {
	var _f1 = 'samples/b-617-2160.jpg';
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
			should(error.find(res.body.err, ecode.fields.PHOTO_RATIO));
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
			should(error.find(res.body.err, ecode.fields.PHOTO_TYPE));
			next();
		});
	});
});

describe("uploading 16:9 2160 jpg", function () {
	var _f1 = 'samples/b-16x9-2160.jpg';
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
			should(res.body.pid);
			_pid = res.body.pid;
			next();
		});
	});
	it("can be confirmed", function (next) {
		express.get('/api/photos/' + _pid).end(function (err, res) {
			should(!res.error);
			should(!res.body.err);
			res.body._id.should.equal(_pid);
			res.body.user._id.should.equal(ufix.user1._id);
			res.body.fname.should.equal('b-16x9-2160.jpg');
			res.body.format.should.equal('JPEG');
			res.body.height.should.equal(2160);
			res.body.vers.should.eql([ 2160, 1440, 1080, 720, 480, 320 ]);
			should(res.body.cdate);
			res.body.comment.should.equal('hello');
			fs.existsSync(photo.getPhotoPath(_pid, _pid + '-2160.jpg')).should.be.true;
			fs.existsSync(photo.getPhotoPath(_pid, _pid + '-1440.jpg')).should.be.true;
			fs.existsSync(photo.getPhotoPath(_pid, _pid + '-1080.jpg')).should.be.true;
			fs.existsSync(photo.getPhotoPath(_pid, _pid + '-720.jpg')).should.be.true;
			fs.existsSync(photo.getPhotoPath(_pid, _pid + '-480.jpg')).should.be.true;
			fs.existsSync(photo.getPhotoPath(_pid, _pid + '-320.jpg')).should.be.true;
			next();
		});
	});
});

