var should = require('should');
var request = require('superagent').agent();

var init = require('../main/init');
var config = require('../main/config')({ test: true });
var mongo = require('../main/mongo')({ dropDatabase: true });
var upload = require('../main/upload');
var express = require('../main/express');
var error = require('../main/error');
var test = require('../main/test')({ request: request });

require('../main/photo-api');
require('../main/session-api');
require('../main/user-api');

before(function (next) {
	init.run(next);
});

before(function () {
	express.listen();
});

var uid;

describe("prepare user", function () {
	it("should success", function (next) {
		test.createUser(function (err, _uid) {
			if (err) return next(err);
			uid = _uid;
			next();
		});
	});
	it("should success", function (next) {
		test.loginUser(next);
	});
});

describe("uploading photo within cycle", function () {
	it("given photo uploaded 23 hour ago", function (next){
		var ph = {
			_id: mongo.getNewPhotoId(),
			userId: uid,
			cdate: new Date(Date.now() - (1 * 60 * 60 * 1000))
		};
		mongo.insertPhoto(ph, next);
	});
	it("should return PHOTO_CYCLE error", function (next) {
		request.post(test.url + '/api/photos').end(function (err, res) {
			should(!err);
			should(!res.error);
			should(res.body.err);
			res.body.err.rc.should.equal(error.PHOTO_CYCLE)
			next();
		});
	});
	it("given emtpy photos", function (next) {
		mongo.photos.remove(next);
	});
	it("given photo uploaded 25 hour ago", function (next){
		var ph = {
			_id: mongo.getNewPhotoId(),
			userId: uid,
			cdate: new Date(Date.now() - (25 * 60 * 60 * 1000))
		};
		mongo.insertPhoto(ph, next);
	});
	it("should not return PHOTO_CYCLE error", function (next) {
		request.post(test.url + '/api/photos').end(function (err, res) {
			should(!err);
			should(!res.error);
			should(res.body.err);
			res.body.err.rc.should.not.equal(error.PHOTO_CYCLE)
			next();
		});
	});
});

describe("uploading no file", function () {
	it("should fail", function (next) {
		request.post(test.url + '/api/photos').end(function (err, res) {
			should(!err);
			should(!res.error);
			should(res.body.err);
			res.body.err.rc.should.equal(error.PHOTO_NO_FILE);
			next();
		});
	});
});

describe("uploading two file", function () {
	var f1 = 'samples/b-16x9-1080.jpg';
	var f2 = 'samples/b-16x9-720.jpg';
	it("should fail", function (next) {
		request.post(test.url + '/api/photos').attach('file', f1).attach('file', f2).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(res.body.err);
			res.body.err.rc.should.equal(error.PHOTO_NOT_ONE);
			next();
		});
	});
});

describe("uploading 1080 jpg", function () {
	var f1 = 'samples/b-16x9-1080.jpg';
	it("should fail", function (next) {
		request.post(test.url + '/api/photos').attach('file', f1).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(res.body.err);
			res.body.err.rc.should.equal(error.PHOTO_HEIGHT);
			next();
		});
	});
});

describe("uploading 16:10 jpg", function () {
	var f1 = 'samples/b-16x10-1440.jpg';
	it("should fail", function (next) {
		request.post(test.url + '/api/photos').attach('file', f1).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(res.body.err);
			res.body.err.rc.should.equal(error.PHOTO_RATIO);
			next();
		});
	});
});

describe("uploading text file", function () {
	var f1 = 'server/test/fixture/dummy1.txt';
	it("should fail", function (next) {
		request.post(test.url + '/api/photos').attach('file', f1).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(res.body.err);
			res.body.err.rc.should.equal(error.PHOTO_TYPE);
			next();
		});
	});
});

describe("uploading 16:9 1440 jpg", function () {
	var f1 = 'samples/b-16x9-1440.jpg';
	var pid;
	it("should success", function (next) {
		this.timeout(8000);
		request.post(test.url + '/api/photos').field('comment', 'hello').attach('file', f1).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			should(res.body.photoId);
			pid = res.body.photoId;
			next();
		});
	});
	it("can be confirmed", function (next) {
		request.get(test.url + '/api/photos/' + pid).end(function (err, res) {
			should(!res.error);
			should(!res.body.err);
			res.body.photoId.should.equal(pid);
			res.body.userId.should.equal(uid);
			res.body.fname.should.equal('b-16x9-1440.jpg');
			res.body.format.should.equal('JPEG');
			res.body.height.should.equal(1440);
			res.body.vers.should.eql([ 1440, 1080, 720, 480, 320 ]);
			should(res.body.cdate);
			res.body.comment.should.equal('hello');
			next();
		});
	});
});

