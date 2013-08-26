var should = require('should');
var fs = require('fs');

var init = require('../lang/init');
var error = require('../error/error');
var fs2 = require('../fs/fs');
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

before(function (next) {
	fs2.emptyDir(imageb.imageDir, next);
});

var _files;

function uploadFiles(file, count, next) {
	if (typeof count == 'function') {
		next = count;
		count = 1;
	}
	var req = express.post('/api/upload');
	for (var i = 0; i < count; i++) {
		req.attach('files', file);
	}
	req.end(function (err, res) {
		should(!err);
		should(!res.error);
		should(!res.body.err);
		res.body.files.should.length(count);
		_files = res.body.files;
		next();
	});
}

describe("uploading 1 photo", function () {
	var _f1 = '3840x2160-169.jpg';
	var _ids;
	before(function (next) {
		mongo.images.remove(next);
	});
	it("given upload files", function (next) {
		uploadFiles('samples/' + _f1, next);
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

describe("uploading too many photos", function () {
	var _f1 = '3840x2160-169.jpg';
	var _ids;
	before(function (next) {
		mongo.images.remove(next);
	});	
	it("given max tmp files", function (next) {
		uploadFiles('samples/' + _f1, config.ticketMax, next);
	});
	it("given max photos", function (next) {
		this.timeout(10000);
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
		uploadFiles('samples/' + _f1, next);
	});
	it("should return empty ids", function (next) {
		this.timeout(10000);
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
	var _f1 = '2880x1620-169.jpg';
	before(function (next) {
		mongo.images.remove(next);
	});
	it("given upload files", function (next) {
		uploadFiles('samples/' + _f1, next);
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
	before(function (next) {
		mongo.images.remove(next);
	});	
	it("given upload files", function (next) {
		uploadFiles('lib/upload/fixture/' + _f1, next);
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
