var should = require('should');

var init = require('../lang/init');
var config = require('../config/config')({ path: 'config/test-rapixel.json' });
var error = require('../error/error');
var mongo = require('../mongo/mongo')({ dropDatabase: true });
var express = require('../express/express');
var upload = require('../upload/upload');
var userf = require('../user/user-fixture');
var imagec = require('../image/image-create');
var imagel = require('../image/image-list');

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
	var images = [];
	for (var i = 0; i < 10; i++) {
		var image = {
			_id: imagec.newImageId(),
			uid: userf.user1._id,
			cdate: new Date(),
			comment: '' + i
		};
		images.push(image);
	};
	mongo.images.insert(images, next);
});

describe("counting", function () {
	it("should success", function (next) {
		mongo.images.count(function (err, c) {
			should(!err);
			c.should.equal(10);
			next();
		})
	});
});

describe("listing all", function () {
	it("should success", function (next) {
		var query = {
			ps: 99
		}
		express.get('/api/images').query(query).end(function (err, res) {
			should(!res.error);
			should(!res.body.err);
			res.body.gt.should.equal(0);
			res.body.lt.should.equal(0);
			res.body.images.length.should.equal(10);
			res.body.images[0]._id.should.equal(10);
			res.body.images[1]._id.should.equal(9);
			res.body.images[2]._id.should.equal(8);
			res.body.images[9]._id.should.equal(1);
			next();
		});
	});
});

describe("listing page 1", function () {
	it("should success", function (next) {
		var query = {
			ps: 4
		};
		express.get('/api/images').query(query).end(function (err, res) {
			should(!res.error);
			should(!res.body.err);
			res.body.gt.should.equal(0);
			res.body.lt.should.equal(7);
			res.body.images.should.length(4);
			res.body.images[0]._id.should.equal(10);
			res.body.images[3]._id.should.equal(7);
			next();
		});
	});
});

describe("listing page 2 with lt", function () {
	it("should success", function (next) {
		var query = {
			lt:7, ps: 4
		}
		express.get('/api/images').query(query).end(function (err, res) {
			should(!res.error);
			should(!res.body.err);
			res.body.gt.should.equal(6);
			res.body.lt.should.equal(3);
			res.body.images.should.length(4);
			res.body.images[0]._id.should.equal(6);
			res.body.images[3]._id.should.equal(3);
			next();
		});
	});
});

describe("listing last page with lt", function () {
	it("should success", function (next) {
		var query = {
			lt: 3, ps: 4
		}
		express.get('/api/images').query(query).end(function (err, res) {
			should(!res.error);
			should(!res.body.err);
			res.body.gt.should.equal(2);
			res.body.lt.should.equal(0);
			res.body.images.should.length(2);
			res.body.images[0]._id.should.equal(2);
			res.body.images[1]._id.should.equal(1);
			next();
		});
	});
});


describe("listing page 2 with gt", function () {
	it("should success", function (next) {
		var query = {
			gt:2, ps: 4
		}
		express.get('/api/images').query(query).end(function (err, res) {
			should(!res.error);
			should(!res.body.err);
			res.body.gt.should.equal(6);
			res.body.lt.should.equal(3);
			res.body.images.should.length(4);
			res.body.images[0]._id.should.equal(6);
			res.body.images[3]._id.should.equal(3);
			next();
		});
	});
});

describe("listing page 1 with gt", function () {
	it("should success", function (next) {
		var query = {
			gt: 6, ps: 4
		};
		express.get('/api/images').query(query).end(function (err, res) {
			should(!res.error);
			should(!res.body.err);
			res.body.gt.should.equal(0);
			res.body.lt.should.equal(7);
			res.body.images.should.length(4);
			res.body.images[0]._id.should.equal(10);
			res.body.images[3]._id.should.equal(7);
			next();
		});
	});
});
