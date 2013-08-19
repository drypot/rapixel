var should = require('should');
var fs = require('fs');

var init = require('../lang/init');
var error = require('../error/error');
var config = require('../config/config')({ path: 'config/test-rapixel.json' });
var mongo = require('../mongo/mongo')({ dropDatabase: true });
var express = require('../express/express');
var upload = require('../upload/upload');
var userf = require('../user/user-fixture');
var imageb = require('../image/image-base');
var imagec = require('../image/image-create');
var imageu = require('../image/image-update');

before(function (next) {
	init.run(next);
});

before(function () {
	express.listen();
});

before(function (next) {
	userf.loginUser1(next);
});

describe("updating with 3840", function () {
	var _id;
	var _files;
	it("given 5120 tmp file", function (next) {
		var _f1 = 'samples/5120x2880-169.jpg';
		express.post('/api/upload').attach('files', _f1).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			_files = res.body.files;
			next();
		});
	});
	it("given 5120 image", function (next) {
		this.timeout(10000);
		var form = { files: _files, comment: 'image1' };
		express.post('/api/images').send(form).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			should(res.body.ids);
			res.body.ids.length.should.equal(1);
			_id = res.body.ids[0];
			next();
		});
	});
	it("can be confirmed", function (next) {
		mongo.images.findOne({ _id: _id }, function (err, image) {
			should(!err);
			should(image);
			image.fname.should.equal('5120x2880-169.jpg');
			image.format.should.equal('jpeg');
			image.width.should.equal(5120);
			image.vers.should.eql([ 5120, 3840, 2880, 2560, 2048, 1920, 1680, 1440, 1366, 1280, 1136, 1024, 960, 640 ]);
			should(image.cdate);
			image.comment.should.equal('image1');
			var dir = imageb.getImageDir(_id);
			fs.existsSync(imageb.getVersionPath(dir, _id, 5120)).should.be.true;
			fs.existsSync(imageb.getVersionPath(dir, _id, 3840)).should.be.true;
			fs.existsSync(imageb.getVersionPath(dir, _id, 640)).should.be.true;
			next();
		});
	});
	it("given 3840 tmp file", function (next) {
		var _f1 = 'samples/3840x2160-169.jpg';
		express.post('/api/upload').attach('files', _f1).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			_files = res.body.files;
			next();
		});
	});
	it("should success updating with 3840", function (next) {
		this.timeout(10000);
		var form = { files: _files, comment: 'updated with 3840' };
		express.put('/api/images/' + _id).send(form).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
	it("can be confirmed", function (next) {
		mongo.images.findOne({ _id: _id }, function (err, image) {
			should(!err);
			should(image);
			image.fname.should.equal('3840x2160-169.jpg');
			image.format.should.equal('jpeg');
			image.width.should.equal(3840);
			image.vers.should.eql([ 3840, 2880, 2560, 2048, 1920, 1680, 1440, 1366, 1280, 1136, 1024, 960, 640 ]);
			should(image.cdate);
			image.comment.should.equal('updated with 3840');
			var dir = imageb.getImageDir(_id);
			fs.existsSync(imageb.getVersionPath(dir, _id, 5120)).should.be.false;
			fs.existsSync(imageb.getVersionPath(dir, _id, 3840)).should.be.true;
			fs.existsSync(imageb.getVersionPath(dir, _id, 1280)).should.be.true;
			fs.existsSync(imageb.getVersionPath(dir, _id, 640)).should.be.true;
			next();
		});
	});
});

describe("updating with no file", function () {
	var _id;
	it("given new image", function (next) {
		var form = {
			_id: _id = imagec.newImageId(),
			uid: userf.user1._id
		};
		mongo.images.insert(form, next);
	});
	it("should success with no file", function (next) {
		var form = { comment: 'updated with no file' };
		express.put('/api/images/' + _id).send(form).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			next();
		});
	});
	it("can be confirmed", function (next) {
		mongo.images.findOne({ _id: _id }, function (err, image) {
			should(!err);
			should(image);
			image.comment.should.equal('updated with no file');
			next();
		});
	});
});

describe("updating with small", function () {
	var _id;
	var _files;
	it("given new image", function (next) {
		var form = {
			_id: _id = imagec.newImageId(),
			uid: userf.user1._id
		};
		mongo.images.insert(form, next);
	});
	it("given 2880 tmp file", function (next) {
		var _f3 = 'samples/2880x1620-169.jpg';
		express.post('/api/upload').attach('files', _f3).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			_files = res.body.files;
			next();
		});
	});
	it("should fail with 2880", function (next) {
		var form = { files: _files };
		express.put('/api/images/' + _id).send(form).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, error.IMAGE_SIZE));
			next();
		});
	});
});

describe("updating with text file", function () {
	var _id;
	var _files;
	it("given new image", function (next) {
		var form = {
			_id: _id = imagec.newImageId(),
			uid: userf.user1._id
		};
		mongo.images.insert(form, next);
	});
	it("given text tmp file", function (next) {
		var _f1 = 'lib/upload/fixture/f1.txt';
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
			should(error.find(res.body.err, error.IMAGE_TYPE));
			next();
		});
	});
});

describe("updating by others", function () {
	var _id;
	var _files;
	it("given new image", function (next) {
		var form = {
			_id: _id = imagec.newImageId(),
			uid: userf.user1._id
		};
		mongo.images.insert(form, next);
	});
	it("given user2 login", function (next) {
		userf.loginUser2(next);
	});
	it("should fail", function (next) {
		var form = { comment: 'xxxx' };
		express.put('/api/images/' + _id).send(form).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, error.NOT_AUTHORIZED));
			next();
		});
	});
});
