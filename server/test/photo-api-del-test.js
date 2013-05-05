var should = require('should');
var fs = require('fs');

var init = require('../main/init');
var config = require('../main/config')({ test: true });
var mongo = require('../main/mongo')({ dropDatabase: true });
var upload = require('../main/upload');
var photo = require('../main/photo');
var fs2 = require('../main/fs');
var express = require('../main/express');
var error = require('../main/error');
var userFix = require('../test/user-fixture');

require('../main/session-api');
require('../main/photo-api');

before(function (next) {
	init.run(next);
});

before(function (next) {
	userFix.createFixtures(next);
});

before(function (next) {
	fs2.rmAll(upload.pubPhoto, next);
});

before(function () {
	express.listen();
});

var f1 = 'samples/b-16x9-2160.jpg';
var pid;

describe("deleting by admin", function () {
	it("given user1 session", function (next) {
		userFix.loginUser1(next);
	});
	it("given photo", function (next) {
		this.timeout(10000);
		express.post('/api/photos').field('comment', 'hello').attach('file', f1).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			should(res.body.photoId);
			pid = res.body.photoId;
			next();
		});
	});
	it("given admin session", function (next) {
		userFix.loginAdmin(next);
	});
	it("should fail", function (next) {
		var p = photo.photoPath(pid) + '/2160.jpg';
		fs.existsSync(p).should.true;
		express.del('/api/photos/' + pid, function (err, res) {
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
		userFix.loginUser1(next);
	});
	it("given photo", function (next) {
		this.timeout(10000);
		express.post('/api/photos').field('comment', 'hello').attach('file', f1).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			should(res.body.photoId);
			pid = res.body.photoId;
			next();
		});
	});
	it("should success", function (next) {
		var p = photo.photoPath(pid) + '/2160.jpg';
		fs.existsSync(p).should.true;
		express.del('/api/photos/' + pid, function (err, res) {
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
		userFix.loginUser1(next);
	});
	it("given photo", function (next) {
		this.timeout(10000);
		express.post('/api/photos').field('comment', 'hello').attach('file', f1).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			should(res.body.photoId);
			pid = res.body.photoId;
			next();
		});
	});
	it("given user2 session", function (next) {
		userFix.loginUser2(next);
	});
	it("should fail", function (next) {
		var p = photo.photoPath(pid) + '/2160.jpg';
		fs.existsSync(p).should.true;
		express.del('/api/photos/' + pid, function (err, res) {
			should(!err);
			should(!res.error);
			should(res.body.err);
			fs.existsSync(p).should.true;
			res.body.err.rc.should.equal(error.PHOTO_NOTHING_TO_DEL);
			next();
		});
	});
});
