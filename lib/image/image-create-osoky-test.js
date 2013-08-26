var should = require('should');
var fs = require('fs');

var init = require('../lang/init');
var error = require('../error/error');
var fs2 = require('../fs/fs');
var config = require('../config/config')({ path: 'config/osoky-test.json' });
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

before(function (next) {
	fs2.emptyDir(imageb.imageDir, next);
});

describe("uploading 1 photo", function () {
	var _f1 = '1440x810-169.jpg';
	var _files;
	var _ids;
	before(function (next) {
		mongo.images.remove(next);
	});	
	it("given upload files", function (next) {
		upload.upload('samples/' + _f1, function (err, files) {
			_files = files;
			next(err);
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
			_ids = res.body.ids;
			next();
		});
	});
	it("check", function (next) {
		var _id = _ids[0];
		mongo.images.findOne({ _id: _id }, function (err, image) {
			should(!err);
			image._id.should.equal(_id);
			image.uid.should.equal(userf.user1._id);
			image.fname.should.equal(_f1);
			image.format.should.equal('jpeg');
			image.vers.should.eql([ 800, 768, 720, 640 ]);
			should(image.cdate);
			image.comment.should.equal('image1');
			var dir = imageb.getImageDir(_id);
			fs.existsSync(imageb.getVersionPath(dir, _id, 900)).should.be.false;
			fs.existsSync(imageb.getVersionPath(dir, _id, 800)).should.be.true;
			fs.existsSync(imageb.getVersionPath(dir, _id, 768)).should.be.true;
			fs.existsSync(imageb.getVersionPath(dir, _id, 720)).should.be.true;
			fs.existsSync(imageb.getVersionPath(dir, _id, 640)).should.be.true;
			next();
		});
	});
});

describe("uploading 3 photos", function () {
	var _f1 = '1280x720-169.jpg';
	var _files;
	var _ids;
	before(function (next) {
		mongo.images.remove(next);
	});	
	it("given upload files", function (next) {
		upload.upload('samples/' + _f1, 3, function (err, files) {
			_files = files;
			next(err);
		});
	});
	it("should success", function (next) {
		this.timeout(10000);
		var form = { files: _files, comment: 'image3' };
		express.post('/api/images').send(form).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			should(res.body.ids);
			res.body.ids.should.length(3);
			_ids = res.body.ids;
			next();
		});
	});
	it("check 1", function (next) {
		var _id = _ids[0];
		mongo.images.findOne({ _id: _id }, function (err, image) {
			should(!err);
			image._id.should.equal(_id);
			image.uid.should.equal(userf.user1._id);
			image.fname.should.equal(_f1);
			image.format.should.equal('jpeg');
			image.vers.should.eql([ 720, 640 ]);
			should(image.cdate);
			image.comment.should.equal('image3');
			var dir = imageb.getImageDir(_id);
			fs.existsSync(imageb.getVersionPath(dir, _id, 768)).should.be.false;
			fs.existsSync(imageb.getVersionPath(dir, _id, 720)).should.be.true;
			fs.existsSync(imageb.getVersionPath(dir, _id, 640)).should.be.true;
			next();
		});
	});
	it("check 3", function (next) {
		var _id = _ids[2];
		mongo.images.findOne({ _id: _id }, function (err, image) {
			should(!err);
			image._id.should.equal(_id);
			image.uid.should.equal(userf.user1._id);
			image.fname.should.equal(_f1);
			image.format.should.equal('jpeg');
			image.vers.should.eql([ 720, 640 ]);
			should(image.cdate);
			image.comment.should.equal('image3');
			var dir = imageb.getImageDir(_id);
			fs.existsSync(imageb.getVersionPath(dir, _id, 768)).should.be.false;
			fs.existsSync(imageb.getVersionPath(dir, _id, 720)).should.be.true;
			fs.existsSync(imageb.getVersionPath(dir, _id, 640)).should.be.true;
			next();
		});
	});
});

describe("uploading too many photos", function () {
	var _f1 = '1136x640-169.jpg';
	var _files;
	var _ids;
	before(function (next) {
		mongo.images.remove(next);
	});	
	it("given max tmp files", function (next) {
		upload.upload('samples/' + _f1, config.ticketMax, function (err, files) {
			_files = files;
			next(err);
		});
	});
	it("given max photos", function (next) {
		var form = { files: _files };
		express.post('/api/images').send(form).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			should(res.body.ids);
			res.body.ids.should.length(config.ticketMax);
			_ids = res.body.ids;
			next();
		});
	});
	it("given one more tmp file", function (next) {
		upload.upload('samples/' + _f1, function (err, files) {
			_files = files;
			next(err);
		});
	});
	it("should return empty ids", function (next) {
		var form = { files: _files };
		express.post('/api/images').send(form).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			should(res.body.ids);
			res.body.ids.should.length(0);
			next();
		});
	});
});

describe("uploading small", function () {
	var _f1 = '640x360-169.jpg';
	var _files;
	before(function (next) {
		mongo.images.remove(next);
	});	
	it("given upload files", function (next) {
		upload.upload('samples/' + _f1, function (err, files) {
			_files = files;
			next(err);
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
	var _f1 = 'f1.txt';
	var _files;
	before(function (next) {
		mongo.images.remove(next);
	});	
	it("given upload files", function (next) {
		upload.upload('lib/upload/fixture/' + _f1, function (err, files) {
			_files = files;
			next(err);
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
