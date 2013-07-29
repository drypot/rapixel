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
