var init = require('../lang/init');
var config = require('../config/config');
var mongo = require('../mongo/mongo');
var userc = require('../user/user-create');

init.run(function (err) {
	mongo.forEach(mongo.users, function (user, next) {
		if (!user.home) {
			process.stdout.write(user._id + 'u ');
			var fields = {
				$set: { home: user.name }
			};
			return mongo.users.update({ _id: user._id }, fields, next);
		}
		process.stdout.write(user._id + 's ');
		next();
	}, function (err) {
		if (err) throw err;
		console.log();
		mongo.db.close();		
	});
});
