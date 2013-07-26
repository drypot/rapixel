var should = require('should');

var init = require('../lang/init');
var config = require('../config/config')({ test: true });
var mongo = require('../mongo/mongo')({ dropDatabase: true });

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
	describe("given a user", function () {
		before(function (next) {
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
});

describe("updateUser", function () {
	var _uid;
	describe("given a user", function () {
		before(function (next) {
			var user = { _id: mongo.getNewUserId(), name: 'snowman-updt' };
			mongo.insertUser(user, function (err) {
				should(!err);
				_uid = user._id;
				next();
			});
		});
		it("should return 1 when success", function (next) {
			mongo.updateUser(_uid, { name: 'snowman-updt2' }, function (err, count) {
				should(!err);
				count.should.equal(1);
				next();
			});
		});
		it("should return 1 when add new field", function (next) {
			mongo.updateUser(_uid, { addr: 'north' }, function (err, count) {
				should(!err);
				count.should.equal(1);
				next();
			});
		});
		it("should return 0 when uid is invalid", function (next) {
			mongo.updateUser(999, { name: 'snowman-xxx' }, function (err, count) {
				should(!err);
				count.should.equal(0);
				next();
			});
		});
		it("can be checked", function (next) {
			mongo.findUser(_uid, function (err, user) {
				should(!err);
				user.should.eql({
					_id: _uid,
					name: 'snowman-updt2',
					addr: 'north'
				});
				next();
			});
		});
	});

});