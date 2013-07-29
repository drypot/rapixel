var init = require('../lang/init');
var mongo = require('../mongo/mongo');

init.add(function (next) {
	var users = mongo.users = mongo.db.collection("users");

	users.ensureIndex({ email: 1 }, function (err) {
		if (err) return next(err);
		users.ensureIndex({ namel: 1 }, function (err) {
			if (err) return next(err);
			users.ensureIndex({ homel: 1 }, next);
		});
	});
});
