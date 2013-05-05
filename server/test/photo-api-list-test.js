var should = require('should');

var init = require('../main/init');
var config = require('../main/config')({ test: true });
var mongo = require('../main/mongo')({ dropDatabase: true });
var upload = require('../main/upload');
var express = require('../main/express');
var error = require('../main/error');
var userFix = require('../test/user-fixture');

require('../main/session-api');
require('../main/photo-api');

before(function (next) {
	init.run(next);
});

before(function (next) {
	userFix.createFixtures(next);
});

before(function () {
	express.listen();
});

before(function (next) {
	userFix.loginUser1(next);
});

before(function (next) {
	var uid = userFix.user1._id;
	var i = 0;
	function insertPhoto() {
		if (i == 10) {
			return next();
		}
		var p = {
			_id: mongo.newPhotoId(),
			userId: uid,
			comment: '' + i
		};
		i++;
		mongo.insertPhoto(p, function (err) {
			if (err) return next(err);
			setImmediate(insertPhoto);
		});
	}
	insertPhoto();
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

var _photos;

describe("listing all", function () {
	it("should success", function (next) {
		var query = {
			pg: 1, ps: 99
		}
		express.get('/api/photos').query(query).end(function (err, res) {
			should(!res.error);
			should(!res.body.err);
			res.body.last.should.true;
			_photos = res.body.photos;
			_photos.length.should.equal(10);
			_photos[0]._id.should.above(_photos[1]._id);
			_photos[1]._id.should.above(_photos[2]._id);
			_photos[2]._id.should.above(_photos[3]._id);
			next();
		});
	});
});

describe("listing page 1", function () {
	it("should success", function (next) {
		var query = {
			pg: 1, ps: 4
		}
		express.get('/api/photos').query(query).end(function (err, res) {
			should(!res.error);
			should(!res.body.err);
			res.body.last.should.false;
			res.body.photos.should.length(4);
			res.body.photos[0]._id.should.equal(_photos[0]._id);
			res.body.photos[3]._id.should.equal(_photos[3]._id);
			next();
		});
	});
});

describe("listing page 2", function () {
	it("should success", function (next) {
		var query = {
			pg: 2, ps: 4
		}
		express.get('/api/photos').query(query).end(function (err, res) {
			should(!res.error);
			should(!res.body.err);
			res.body.last.should.false;
			res.body.photos.should.length(4);
			res.body.photos[0]._id.should.equal(_photos[4]._id);
			res.body.photos[3]._id.should.equal(_photos[7]._id);
			next();
		});
	});
});

describe("listing last page", function () {
	it("should success", function (next) {
		var query = {
			pg: 3, ps: 4
		}
		express.get('/api/photos').query(query).end(function (err, res) {
			should(!res.error);
			should(!res.body.err);
			res.body.last.should.true;
			res.body.photos.should.length(2);
			res.body.photos[0]._id.should.equal(_photos[8]._id);
			res.body.photos[1]._id.should.equal(_photos[9]._id);
			next();
		});
	});
});
