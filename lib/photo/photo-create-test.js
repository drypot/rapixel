var should = require('should');
var fs = require('fs');

var init = require('../lang/init');
var config = require('../config/config')({ path: 'config/test.json' });
var mongo = require('../mongo/mongo')({ dropDatabase: true });
var express = require('../express/express');
var upload = require('../upload/upload');
var userf = require('../user/user-fixture');
var photob = require('../photo/photo-base');
var photoc = require('../photo/photo-create');
var error = require('../error/error');
var ecode = require('../error/ecode');

before(function (next) {
	init.run(next);
});

before(function () {
	express.listen();
});

before(function (next) {
	userf.create(next);
});

before(function (next) {
	userf.loginUser1(next);
});

var _now = new Date();

describe("uploading 3840 jpg", function () {
	var _f1 = 'samples/c-3840-169.jpg';
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
		var form = { files: _files, comment: 'image1' };
		express.post('/api/photos').send(form).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			should(res.body.ids);
			_pid = res.body.ids[0];
			next();
		});
	});
	it("can be confirmed", function (next) {
		mongo.photos.findOne({ _id: _pid }, function (err, photo) {
			should(!err);
			photo._id.should.equal(_pid);
			photo.uid.should.equal(userf.user1._id);
			photo.fname.should.equal('c-3840-169.jpg');
			photo.format.should.equal('jpeg');
			photo.width.should.equal(3840);
			photo.vers.should.eql([ 3840, 2880, 2560, 2048, 1920, 1680, 1440, 1366, 1280, 1136, 1024, 960, 640 ]);
			should(photo.cdate);
			photo.comment.should.equal('image1');
			var dir = photob.getPhotoDir(_pid);
			fs.existsSync(photob.getVersionPath(dir, _pid, 3840)).should.be.true;
			fs.existsSync(photob.getVersionPath(dir, _pid, 1280)).should.be.true;
			fs.existsSync(photob.getVersionPath(dir, _pid, 640)).should.be.true;
			next();
		});
	});
});


describe("uploading small", function () {
	var _f1 = 'samples/c-2560-169.jpg';
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
	var _f1 = 'lib/upload/fixture/f1.txt';
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

describe("uploading no file", function () {
	it("should fail", function (next) {
		var form = { };
		express.post('/api/photos').send(form).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, ecode.PHOTO_NO_FILE));
			next();
		});
	});
});

// TODO:

// describe.only("uploading photo within cycle", function () {
// 	it("given photo uploaded 3 hour ago", function (next){
// 		var photo = {
// 			_id: photoc.newPhotoId(),
// 			uid: userf.user1._id,
// 			cdate: new Date(Date.now() - (3 * 60 * 60 * 1000))
// 		};
// 		mongo.photos.insert(photo, next);
// 	});
// 	it("should return PHOTO_CYCLE error", function (next) {
// 		var form = { files: [{ oname: 'dummy.jpg', tname: 'xxxxx' }] };
// 		express.post('/api/photos').send(form).end(function (err, res) {
// 			should(!err);
// 			should(!res.error);
// 			console.log(res.body);
// 			should(res.body.err);
// 			should(error.find(res.body.err, ecode.PHOTO_CYCLE));
// 			next();
// 		});
// 	});
// });


