var should = require('should');
var fs = require('fs');

var init = require('../lang/init');
var config = require('../config/config')({ path: 'config/test-rapixel.json' });
var mongo = require('../mongo/mongo')({ dropDatabase: true });
var express = require('../express/express');
var imagel = require('../image/image');
var error = require('../error/error');

var userf = require('../user/user-fixture');

require('../main/session-api');
require('../image/image-api');
require('../upload/upload-api');

function versionExists(id, ver) {
	var dir = imagel.getImageDir(id);
	return fs.existsSync(imagel.getVersionPath(dir, id, ver));
}

before(function (next) {
	init.run(next);
});

before(function () {
	express.listen();
});

before(function (next) {
	userf.loginUser1(next);
});

describe("updating a image", function () {
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
		express.post('/api/images').send(form).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			should(res.body.image._id);
			_id = res.body.image._id;
			next();
		});
	});
	before(function (next) {
		mongo.findImage(_id, function (err, image) {
			should(!err);
			should(image);
			image.fname.should.equal('c-169-5120.jpg');
			image.width.should.equal(5120);
			image.height.should.equal(2880);
			image.comment.should.equal('cool pic');
			versionExists(_id, 5120).should.be.true;
			next();
		});
	});
	describe("without image", function () {
		it("should success", function (next) {
			var form = { comment: 'cool updated' };
			express.put('/api/images/' + _id).send(form).end(function (err, res) {
				should(!err);
				should(!res.error);
				should(!res.body.err);
				next();
			});
		});
		it("can be confirmed", function (next) {
			mongo.findImage(_id, function (err, image) {
				should(!err);
				should(image);
				image.comment.should.equal('cool updated');
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
			express.put('/api/images/' + _id).send(form).end(function (err, res) {
				should(!err);
				should(!res.error);
				should(res.body.err);
				should(error.find(res.body.err, error.ids.IMAGE_SIZE));
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
			express.put('/api/images/' + _id).send(form).end(function (err, res) {
				should(!err);
				should(!res.error);
				should(res.body.err);
				should(error.find(res.body.err, error.ids.IMAGE_TYPE));
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
			express.put('/api/images/' + _id).send(form).end(function (err, res) {
				should(!err);
				should(!res.error);
				should(!res.body.err);
				versionExists(_id, 5120).should.be.false;
				versionExists(_id, 3840).should.be.true;
				next();
			});
		});
		it("can be confirmed", function (next) {
			mongo.findImage(_id, function (err, image) {
				should(!err);
				should(image);
				image.fname.should.equal('c-169-3840.jpg');
				image.width.should.equal(3840);
				image.height.should.equal(2160);
				image.vers.should.not.include(5120);
				image.vers.should.include(3840);
				image.comment.should.equal('updated with 3840');
				next();
			});
		});
	});
	describe("by other user", function () {
		before(function (next) {
			userf.loginUser2(next);
		});
		it("should fail", function (next) {
			var form = { comment: 'xxxx' };
			express.put('/api/images/' + _id).send(form).end(function (err, res) {
				should(!err);
				should(!res.error);
				should(res.body.err);
				should(error.find(res.body.err, error.ids.NOT_AUTHORIZED));
				next();
			});
		});
	});
});


