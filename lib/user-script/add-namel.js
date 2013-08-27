var init = require('../lang/init');
var config = require('../config/config');
var mongo = require('../mongo/mongo');
var userc = require('../user/user-create');

init.run(function (err) {
	mongo.forEach(mongo.users, function (user, next) {
		if (!user.namel) {
			process.stdout.write(user._id + 'u ');
			var fields = {};
			if (!user.home) {
				user.home = user.name;
				fields.home = user.home;
			}
			fields.namel = user.name.toLowerCase();
			fields.homel = user.home.toLowerCase();
			return mongo.users.update({ _id: user._id }, { $set: fields }, next);
		}
		process.stdout.write(user._id + 's ');
		next();
	}, function (err) {
		if (err) throw err;
		console.log('done');
		mongo.db.close();
	});
});
