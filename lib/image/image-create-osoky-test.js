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

var _files;

function uploadTmp(file, count, next) {
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
	var _f1 = '1440x810-169.jpg';
		var _ids;
		it("given emtpy photos", function (next) {
			mongo.images.remove(next);
		});
		it("given tmp file", function (next) {
			uploadTmp('samples/' + _f1, next);
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
	var _ids;
	it("given emtpy photos", function (next) {
		mongo.images.remove(next);
	});
	it("given tmp file", function (next) {
		uploadTmp('samples/' + _f1, 3, next);
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
	var _ids;
	it("given emtpy photos", function (next) {
		mongo.images.remove(next);
	});
	it("given max tmp files", function (next) {
		uploadTmp('samples/' + _f1, config.data.freeMax, next);
	});
	it("given max photos", function (next) {
		var form = { files: _files };
		express.post('/api/photos').send(form).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			should(res.body.ids);
			res.body.ids.should.length(config.data.freeMax);
			_ids = res.body.ids;
			next();
		});
	});
	it("given one more tmp file", function (next) {
		uploadTmp('samples/' + _f1, next);
	});
	it("should return empty ids", function (next) {
		var form = { files: _files };
		express.post('/api/photos').send(form).end(function (err, res) {
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

