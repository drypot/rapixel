var should = require('should');
var fs = require('fs');

var init = require('../lang/init');
var config = require('../config/config')({ path: 'config/test.json' });
var mongo = require('../mongo/mongo')({ dropDatabase: true });
var express = require('../express/express');
var upload = require('../upload/upload');
var userf = require('../user/user-fixture');
var imagec = require('../image/image-create');
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
	var images = [];
	for (var i = 0; i < count; i++) {
		var image = {
			_id: imagec.newPhotoId(),
			uid: userf.user1._id,
			cdate: new Date(_now.getTime() - (hours * 60 * 60 * 1000))
		};
		images.push(image);
	}
	mongo.images.insert(images, next);
}

describe("getTicketCount", function () {
	it("given emtpy images", function (next) {
		mongo.images.remove(next);
	});
	it("should return ticketMax", function (next) {
		imagec.getTicketCount(_now, userf.user1, function (err, count, hours) {
			should(!err);
			count.should.equal(config.data.ticketMax);
			next();
		});
	});
	it("given a image out of time", function (next) {
		genPhoto(config.data.ticketGenInterval + 1, next);
	});
	it("should return ticketMax", function (next) {
		imagec.getTicketCount(_now, userf.user1, function (err, count, hours) {
			should(!err);
			count.should.equal(config.data.ticketMax);
			next();
		});
	});
	it("given a image in time", function (next) {
		genPhoto(config.data.ticketGenInterval - 1, next);
	});
	it("should return (ticketMax - 1)", function (next) {
		imagec.getTicketCount(_now, userf.user1, function (err, count, hours) {
			should(!err);
			count.should.equal(config.data.ticketMax - 1);
			next();
		});
	});
	it("given emtpy images", function (next) {
		mongo.images.remove(next);
	});
	it("given ticketMax images in time", function (next) {
		genPhoto(config.data.ticketGenInterval - 3, config.data.ticketMax, next);
	});
	it("should return 0 and hours", function (next) {
		imagec.getTicketCount(_now, userf.user1, function (err, count, hours) {
			should(!err);
			count.should.equal(0);
			hours.should.equal(3);
			next();
		});
	});
});