var init = require('../lang/init');
var mongo = require('../mongo/mongo');

init.add(function (next) {

	var users;

	users = exports.users = exports.db.collection("users");
	users.ensureIndex({ email: 1 }, function (err) {
		if (err) return next(err);
		users.ensureIndex({ name: 1 }, function (err) {
			if (err) return next(err);
			users.ensureIndex({ home: 1 }, function (err) {
				if (err) return next(err);
				var opt = {
					fields: { _id: 1 },
					sort: { _id: -1 },
					limit: 1
				}
				users.find({}, opt).nextObject(function (err, obj) {
					if (err) return next(err);
					userIdSeed = obj ? obj._id : 0;
					console.log('mongo: user id seed = ' + userIdSeed);
					next();
				});
			});
		});
	});

});
