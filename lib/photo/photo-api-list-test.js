var should = require('should');

var init = require('../main/init');
var config = require('../main/config')({ test: true });
var mongo = require('../main/mongo')({ dropDatabase: true });
var upload = require('../main/upload');
var express = require('../main/express');
var error = require('../main/error');
var ecode = require('../main/ecode');
var ufix = require('../test/user-fixture');

require('../main/session-api');
require('../main/photo-api');

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

before(function (next) {
	var i = 0;
	function insert() {
		if (i == 10) {
			return next();
		}
		var p = {
			_id: mongo.newPhotoId(),
			uid: ufix.user1._id,
			cdate: new Date(),
			comment: '' + i
		};
		i++;
		mongo.insertPhoto(p, function (err) {
			if (err) return next(err);
			setImmediate(insert);
		});
	}
	insert();
});

describe("counting", function () {
	it("should success", function (next) {
		mongo.photos.count(function (err, c) {
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
		express.get('/api/photos').query(query).end(function (err, res) {
			should(!res.error);
			should(!res.body.err);
			res.body.gt.should.equal(0);
			res.body.lt.should.equal(0);
			res.body.photos.length.should.equal(10);
			res.body.photos[0]._id.should.equal(10);
			res.body.photos[1]._id.should.equal(9);
			res.body.photos[2]._id.should.equal(8);
			res.body.photos[9]._id.should.equal(1);
			next();
		});
	});
});

describe("listing page 1", function () {
	it("should success", function (next) {
		var query = {
			ps: 4
		};
		express.get('/api/photos').query(query).end(function (err, res) {
			should(!res.error);
			should(!res.body.err);
			res.body.gt.should.equal(0);
			res.body.lt.should.equal(7);
			res.body.photos.should.length(4);
			res.body.photos[0]._id.should.equal(10);
			res.body.photos[3]._id.should.equal(7);
			next();
		});
	});
});

describe("listing page 2 with lt", function () {
	it("should success", function (next) {
		var query = {
			lt:7, ps: 4
		}
		express.get('/api/photos').query(query).end(function (err, res) {
			should(!res.error);
			should(!res.body.err);
			res.body.gt.should.equal(6);
			res.body.lt.should.equal(3);
			res.body.photos.should.length(4);
			res.body.photos[0]._id.should.equal(6);
			res.body.photos[3]._id.should.equal(3);
			next();
		});
	});
});

describe("listing last page with lt", function () {
	it("should success", function (next) {
		var query = {
			lt: 3, ps: 4
		}
		express.get('/api/photos').query(query).end(function (err, res) {
			should(!res.error);
			should(!res.body.err);
			res.body.gt.should.equal(2);
			res.body.lt.should.equal(0);
			res.body.photos.should.length(2);
			res.body.photos[0]._id.should.equal(2);
			res.body.photos[1]._id.should.equal(1);
			next();
		});
	});
});


describe("listing page 2 with gt", function () {
	it("should success", function (next) {
		var query = {
			gt:2, ps: 4
		}
		express.get('/api/photos').query(query).end(function (err, res) {
			should(!res.error);
			should(!res.body.err);
			res.body.gt.should.equal(6);
			res.body.lt.should.equal(3);
			res.body.photos.should.length(4);
			res.body.photos[0]._id.should.equal(6);
			res.body.photos[3]._id.should.equal(3);
			next();
		});
	});
});

describe("listing page 1 with gt", function () {
	it("should success", function (next) {
		var query = {
			gt: 6, ps: 4
		};
		express.get('/api/photos').query(query).end(function (err, res) {
			should(!res.error);
			should(!res.body.err);
			res.body.gt.should.equal(0);
			res.body.lt.should.equal(7);
			res.body.photos.should.length(4);
			res.body.photos[0]._id.should.equal(10);
			res.body.photos[3]._id.should.equal(7);
			next();
		});
	});
});
