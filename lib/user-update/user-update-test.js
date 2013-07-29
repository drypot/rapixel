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