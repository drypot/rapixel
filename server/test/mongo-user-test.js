var should = require('should');

var init = require('../main/init');
var config = require('../main/config')({ test: true });
var mongo = require('../main/mongo')({ dropDatabase: true });

before(function (next) {
	init.run(next);
});

describe("db", function () {
	it("should have databaseName", function () {
		mongo.db.databaseName.should.equal(config.data.mongoDb);
	});
});

describe("users collection", function () {
	it("should exist", function () {
		should.exist(mongo.users);
	});
	it("can make serialized ids", function () {
		var id1 = mongo.getNewUserId();
		var id2 = mongo.getNewUserId();
		should(id1 < id2);
	});
});

describe("findUser", function () {
	var _uid;
	it("given a user", function (next) {
		var user = { _id: mongo.getNewUserId(), name: 'snowman' };
		mongo.insertUser(user, function (err) {
			should(!err);
			_uid = user._id;
			next();
		});
	});
	it("should success", function (next) {
		mongo.findUser(_uid, function (err, user) {
			should(!err);
			user._id.should.equal(_uid);
			user.name.should.equal('snowman');
			next();
		});
	});
	it("should return null with invalid id", function (next) {
		mongo.findUser(999, function (err, user) {
			should(!err);
			should(!user);
			next();
		});
	});
});
