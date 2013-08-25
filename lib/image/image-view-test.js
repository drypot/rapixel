var should = require('should');

var init = require('../lang/init');
var error = require('../error/error');
var config = require('../config/config')({ path: 'config/rapixel-test.json' });
var mongo = require('../mongo/mongo')({ dropDatabase: true });
var express = require('../express/express');
var upload = require('../upload/upload');
var userf = require('../user/user-fixture');
var imagec = require('../image/image-create');
var imagev = require('../image/image-view');

before(function (next) {
	init.run(next);
});

before(function () {
	express.listen();
});

before(function (next) {
	userf.loginUser1(next);
});

describe("get image", function () {
	var _f1 = 'samples/3840x2160-169.jpg';
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
	it("given new image", function (next) {
		this.timeout(10000);
		var form = { files: _files, comment: 'image1' };
		express.post('/api/images').send(form).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			should(res.body.ids);
			res.body.ids.length.should.equal(1);
			_pid = res.body.ids[0];
			next();
		});
	});
	it("should success", function (next) {
		express.get('/api/images/' + _pid).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			res.body.hit.should.equal(0);
			next();
		});
	});
	it("should success with hit", function (next) {
		express.get('/api/images/' + _pid + '?hit').end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			res.body.hit.should.equal(1);
			next();
		});
	});
});

