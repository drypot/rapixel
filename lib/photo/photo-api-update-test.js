var should = require('should');
var fs = require('fs');

var init = require('../main/init');
var config = require('../main/config')({ test: true });
var mongo = require('../main/mongo')({ dropDatabase: true });
var express = require('../main/express');
var photol = require('../main/photo');
var error = require('../main/error');
var ecode = require('../main/ecode');
var ufix = require('../test/user-fixture');

require('../main/session-api');
require('../main/photo-api');
require('../main/upload-api');

function versionExists(id, ver) {
	var dir = photol.getPhotoDir(id);
	return fs.existsSync(photol.getVersionPath(dir, id, ver));
}

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

describe("updating a photo", function () {
	var _f1 = 'samples/c-169-5120.jpg';
	var _id;
	var _files;
	before(function (next) {
		express.post('/api/upload').attach('files', _f1).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			_files = res.body.files;
			next();
		});
	});
	before(function (next) {
		this.timeout(10000);
		var form = { files: _files, comment: 'cool pic' };
		express.post('/api/photos').send(form).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			should(res.body.photo._id);
			_id = res.body.photo._id;
			next();
		});
	});
	before(function (next) {
		mongo.findPhoto(_id, function (err, photo) {
			should(!err);
			should(photo);
			photo.fname.should.equal('c-169-5120.jpg');
			photo.width.should.equal(5120);
			photo.height.should.equal(2880);
			photo.comment.should.equal('cool pic');
			versionExists(_id, 5120).should.be.true;
			next();
		});
	});
	describe("without photo", function () {
		it("should success", function (next) {
			var form = { comment: 'cool updated' };
			express.put('/api/photos/' + _id).send(form).end(function (err, res) {
				should(!err);
				should(!res.error);
				should(!res.body.err);
				next();
			});
		});
		it("can be confirmed", function (next) {
			mongo.findPhoto(_id, function (err, photo) {
				should(!err);
				should(photo);
				photo.comment.should.equal('cool updated');
				versionExists(_id, 5120).should.be.true;
				next();
			});
		});
	});
	describe("with small", function () {
		var _f1 = 'samples/c-169-2560.jpg';
		before(function (next) {
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
			express.put('/api/photos/' + _id).send(form).end(function (err, res) {
				should(!err);
				should(!res.error);
				should(res.body.err);
				should(error.find(res.body.err, ecode.PHOTO_SIZE));
				next();
			});
		});
	});
	describe("with text file", function () {
		var _f1 = 'server/test/fixture/dummy1.txt';
		before(function (next) {
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
			express.put('/api/photos/' + _id).send(form).end(function (err, res) {
				should(!err);
				should(!res.error);
				should(res.body.err);
				should(error.find(res.body.err, ecode.PHOTO_TYPE));
				next();
			});
		});
	});
	describe("with 3840 jpg", function () {
		var _f1 = 'samples/c-169-3840.jpg';
		before(function (next) {
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
			var form = { files: _files, comment: 'updated with 3840' };
			versionExists(_id, 5120).should.be.true;
			express.put('/api/photos/' + _id).send(form).end(function (err, res) {
				should(!err);
				should(!res.error);
				should(!res.body.err);
				versionExists(_id, 5120).should.be.false;
				versionExists(_id, 3840).should.be.true;
				next();
			});
		});
		it("can be confirmed", function (next) {
			mongo.findPhoto(_id, function (err, photo) {
				should(!err);
				should(photo);
				photo.fname.should.equal('c-169-3840.jpg');
				photo.width.should.equal(3840);
				photo.height.should.equal(2160);
				photo.vers.should.not.include(5120);
				photo.vers.should.include(3840);
				photo.comment.should.equal('updated with 3840');
				next();
			});
		});
	});
	describe("by other user", function () {
		before(function (next) {
			ufix.loginUser2(next);
		});
		it("should fail", function (next) {
			var form = { comment: 'xxxx' };
			express.put('/api/photos/' + _id).send(form).end(function (err, res) {
				should(!err);
				should(!res.error);
				should(res.body.err);
				should(error.find(res.body.err, ecode.NOT_AUTHORIZED));
				next();
			});
		});
	});
});


