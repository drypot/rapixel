var init = require('../lang/init');
var config = require('../config/config');
var mongo = require('../mongo/mongo');
var userc = require('../user/user-create');

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
		console.log('done');
		mongo.db.close();		
	});
});
