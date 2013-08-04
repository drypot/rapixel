var init = require('../lang/init');
var config = require('../config/config')({ parseArg: true });
var mongo = require('../mongo/mongo');
var userb = require('../user/user-base');

init.run(function (err) {
	mongo.forEach(mongo.users, function (user, next) {
		if (!user.namel) {
			process.stdout.write(user._id + 'u ');
			var fields = {
				$set: { 
					namel: user.name.toLowerCase(),
					homel: user.home.toLowerCase() 
				}
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