var should = require('should');

var init = require('../main/init');
var config = require('../main/config')({ test: true });
var mongo = require('../main/mongo')({ dropDatabase: true });
var photol = require('../main/photo');
var error = require('../main/error');
var ufix = require('../test/user-fixture');

var now = new Date();

before(function (next) {
	init.run(next);
});

before(function (next) {
	ufix.createFixtures(next);
});

describe("findHours", function () {
	it("given emtpy photos", function (next) {
		mongo.photos.remove(next);
	});
	it("given photo 3 hours passed", function (next){
		var ph = {
			_id: mongo.newPhotoId(),
			uid: ufix.user1._id,
			cdate: new Date(now.getTime() - (3 * 60 * 60 * 1000))
		};
		mongo.insertPhoto(ph, next);
	});
	it("should return 15", function (next) {
		photol.findHours(ufix.user1, now, function (err, hours) {
			should(!err);
			hours.should.equal(15);
			next();
		});
	});
	it("given emtpy photos", function (next) {
		mongo.photos.remove(next);
	});
	it("given photo 20 hours passed", function (next){
		var ph = {
			_id: mongo.newPhotoId(),
			uid: ufix.user1._id,
			cdate: new Date(now.getTime() - (20 * 60 * 60 * 1000))
		};
		mongo.insertPhoto(ph, next);
	});
	it("should return 0", function (next) {
		photol.findHours(ufix.user1, now, function (err, hours) {
			should(!err);
			hours.should.equal(0);
			next();
		});
	});
});