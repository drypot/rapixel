var should = require('should');

var init = require('../lang/init');
var config = require('../config/config')({ path: 'config/test.json' });
var mongo = require('../mongo/mongo')({ dropDatabase: true });
var photol = require('../photo/photo');
var userf = require('../user/user-fixture');

var now = new Date();

before(function (next) {
	init.run(next);
});

before(function (next) {
	userf.create(next);
});

describe("findHours", function () {
	it("given emtpy photos", function (next) {
		mongo.photos.remove(next);
	});
	it("given photo 3 hours passed", function (next){
		var ph = {
			_id: mongo.newPhotoId(),
			uid: userf.user1._id,
			cdate: new Date(now.getTime() - (3 * 60 * 60 * 1000))
		};
		mongo.insertPhoto(ph, next);
	});
	it("should return 15", function (next) {
		photol.findHours(userf.user1, now, function (err, hours) {
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
			uid: userf.user1._id,
			cdate: new Date(now.getTime() - (20 * 60 * 60 * 1000))
		};
		mongo.insertPhoto(ph, next);
	});
	it("should return 0", function (next) {
		photol.findHours(userf.user1, now, function (err, hours) {
			should(!err);
			hours.should.equal(0);
			next();
		});
	});
});