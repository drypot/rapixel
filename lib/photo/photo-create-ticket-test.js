var should = require('should');
var fs = require('fs');

var init = require('../lang/init');
var config = require('../config/config')({ path: 'config/test.json' });
var mongo = require('../mongo/mongo')({ dropDatabase: true });
var express = require('../express/express');
var upload = require('../upload/upload');
var userf = require('../user/user-fixture');
var photoc = require('../photo/photo-create');
var error = require('../error/error');
var ecode = require('../error/ecode');

before(function (next) {
	init.run(next);
});

before(function () {
	express.listen();
});

before(function (next) {
	userf.create(next);
});

before(function (next) {
	userf.loginUser1(next);
});

var _now = new Date();

function genPhoto(hours, count, next) {
	if (typeof count == 'function') {
		next = count;
		count = 1;
	}
	var photos = [];
	for (var i = 0; i < count; i++) {
		var photo = {
			_id: photoc.newPhotoId(),
			uid: userf.user1._id,
			cdate: new Date(_now.getTime() - (hours * 60 * 60 * 1000))
		};
		photos.push(photo);
	}
	mongo.photos.insert(photos, next);
}

describe("getTicketCount", function () {
	it("given emtpy photos", function (next) {
		mongo.photos.remove(next);
	});
	it("should return ticketMax", function (next) {
		photoc.getTicketCount(_now, userf.user1, function (err, count, hours) {
			should(!err);
			count.should.equal(config.data.ticketMax);
			next();
		});
	});
	it("given a photo out of time", function (next) {
		genPhoto(config.data.ticketGenInterval + 1, next);
	});
	it("should return ticketMax", function (next) {
		photoc.getTicketCount(_now, userf.user1, function (err, count, hours) {
			should(!err);
			count.should.equal(config.data.ticketMax);
			next();
		});
	});
	it("given a photo in time", function (next) {
		genPhoto(config.data.ticketGenInterval - 1, next);
	});
	it("should return (ticketMax - 1)", function (next) {
		photoc.getTicketCount(_now, userf.user1, function (err, count, hours) {
			should(!err);
			count.should.equal(config.data.ticketMax - 1);
			next();
		});
	});
	it("given emtpy photos", function (next) {
		mongo.photos.remove(next);
	});
	it("given ticketMax photos in time", function (next) {
		genPhoto(config.data.ticketGenInterval - 3, config.data.ticketMax, next);
	});
	it("should return 0 and hours", function (next) {
		photoc.getTicketCount(_now, userf.user1, function (err, count, hours) {
			should(!err);
			count.should.equal(0);
			hours.should.equal(3);
			next();
		});
	});
});