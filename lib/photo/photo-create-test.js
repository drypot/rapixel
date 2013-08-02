var should = require('should');
var fs = require('fs');

var init = require('../lang/init');
var config = require('../config/config')({ path: 'config/test.json' });
var mongo = require('../mongo/mongo')({ dropDatabase: true });
var express = require('../express/express');
var upload = require('../upload/upload');
var userf = require('../user/user-fixture');
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

function genPhoto(hours, count, next) {
	if (typeof count == 'function') {
		next = count;
		count = 1;
	}
	var photos = [];
	for (var i = 0; i < count; i++) {
		var photo = {
			_id: photoc.newPhotoId(),
			uid: userf.user1._id,
			cdate: new Date(_now.getTime() - (hours * 60 * 60 * 1000))
		};
		photos.push(photo);
	}
	mongo.photos.insert(photos, next);
}

describe.only("getTicketCount", function () {
	it("given emtpy photos", function (next) {
		mongo.photos.remove(next);
	});
	it("should return ticketMax", function (next) {
		photoc.getTicketCount(_now, userf.user1, function (err, count, hours) {
			should(!err);
			count.should.equal(config.data.ticketMax);
			next();
		});
	});
	it("given a photo out of time", function (next) {
		genPhoto(config.data.ticketGenInterval + 1, next);
	});
	it("should return ticketMax", function (next) {
		photoc.getTicketCount(_now, userf.user1, function (err, count, hours) {
			should(!err);
			count.should.equal(config.data.ticketMax);
			next();
		});
	});
	it("given a photo in time", function (next) {
		genPhoto(config.data.ticketGenInterval - 1, next);
	});
	it("should return (ticketMax - 1)", function (next) {
		photoc.getTicketCount(_now, userf.user1, function (err, count, hours) {
			should(!err);
			count.should.equal(config.data.ticketMax - 1);
			next();
		});
	});
	it("given emtpy photos", function (next) {
		mongo.photos.remove(next);
	});
	it("given ticketMax photos in time", function (next) {
		genPhoto(config.data.ticketGenInterval - 3, config.data.ticketMax, next);
	});
	it("should return 0 and hours", function (next) {
		photoc.getTicketCount(_now, userf.user1, function (err, count, hours) {
			should(!err);
			count.should.equal(0);
			hours.should.equal(3);
			next();
		});
	});
});


describe("uploading photo within cycle", function () {
	it("given photo uploaded 3 hour ago", function (next){
		var photo = {
			_id: photoc.newPhotoId(),
			uid: userf.user1._id,
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
			res.body.user._id.should.equal(userf.user1._id);
			res.body.fname.should.equal('c-169-3840.jpg');
			res.body.format.should.equal('jpeg');
			res.body.width.should.equal(3840);
			res.body.vers.should.eql([ 3840, 2880, 2560, 2048, 1920, 1680, 1440, 1366, 1280, 1136, 1024, 960, 640 ]);
			should(res.body.cdate);
			res.body.comment.should.equal('hello');
			var dir = photoc.getPhotoDir(_pid);
			fs.existsSync(photoc.getVersionPath(dir, _pid, 3840)).should.be.true;
			fs.existsSync(photoc.getVersionPath(dir, _pid, 1280)).should.be.true;
			fs.existsSync(photoc.getVersionPath(dir, _pid, 640)).should.be.true;
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


