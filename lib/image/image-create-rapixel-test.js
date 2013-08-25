var should = require('should');
var fs = require('fs');

var init = require('../lang/init');
var error = require('../error/error');
var config = require('../config/config')({ path: 'config/rapixel-test.json' });
var mongo = require('../mongo/mongo')({ dropDatabase: true });
var express = require('../express/express');
var upload = require('../upload/upload');
var userf = require('../user/user-fixture');
var imageb = require('../image/image-base');
var imagec = require('../image/image-create');

before(function (next) {
	init.run(next);
});

before(function () {
	express.listen();
});

before(function (next) {
	userf.loginUser1(next);
});

describe("uploading 3840 jpg", function () {
	var _id;
	var _files;
	it("given tmp file", function (next) {
		var _f1 = 'samples/3840x2160-169.jpg';
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
	it("check", function (next) {
		mongo.images.findOne({ _id: _id }, function (err, image) {
			should(!err);
			image._id.should.equal(_id);
			image.uid.should.equal(userf.user1._id);
			image.fname.should.equal('3840x2160-169.jpg');
			image.format.should.equal('jpeg');
			image.width.should.equal(3840);
			image.vers.should.eql([ 3840, 2880, 2560, 2048, 1920, 1680, 1440, 1366, 1280, 1136, 1024, 960, 640 ]);
			should(image.cdate);
			image.comment.should.equal('image1');
			var dir = imageb.getImageDir(_id);
			fs.existsSync(imageb.getVersionPath(dir, _id, 5120)).should.be.false;
			fs.existsSync(imageb.getVersionPath(dir, _id, 3840)).should.be.true;
			fs.existsSync(imageb.getVersionPath(dir, _id, 1280)).should.be.true;
			fs.existsSync(imageb.getVersionPath(dir, _id, 640)).should.be.true;
			next();
		});
	});
});

describe("uploading small", function () {
	var _files;
	before(function (next) {
		mongo.images.remove(next);
	});
	it("given tmp file", function (next) {
		var _f1 = 'samples/2880x1620-169.jpg';
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
		express.post('/api/images').send(form).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, error.IMAGE_SIZE));
			next();
		});
	});
});

describe("uploading text file", function () {
	var _files;
	before(function (next) {
		mongo.images.remove(next);
	});	
	it("given tmp file", function (next) {
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
		express.post('/api/images').send(form).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, error.IMAGE_TYPE));
			next();
		});
	});
});

describe("uploading no file", function () {
	before(function (next) {
		mongo.images.remove(next);
	});	
	it("should fail", function (next) {
		var form = { };
		express.post('/api/images').send(form).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(res.body.err);
			should(error.find(res.body.err, error.IMAGE_NO_FILE));
			next();
		});
	});
});

describe("uploading image within cycle", function () {
	before(function (next) {
		mongo.images.remove(next);
	});
	it("given image uploaded 3 hour ago", function (next){
		var image = {
			_id: imagec.newId(),
			uid: userf.user1._id,
			cdate: new Date(Date.now() - (3 * 60 * 60 * 1000))
		};
		mongo.images.insert(image, next);
	});
	it("should return IMAGE_CYCLE error", function (next) {
		var form = { files: [{ oname: 'dummy.jpg', tname: 'xxxxx' }] };
		express.post('/api/images').send(form).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			should(res.body.ids);
			res.body.ids.length.should.equal(0);
			next();
		});
	});
});

