var init = require('../lang/init');
var config = require('../config/config')({ parseArg: true });
var mongo = require('../mongo/mongo');

init.add(function (next) {
	var cursor = mongo.users.find();
	function read() {
		cursor.nextObject(function (err, user) {
			if (err) return next(err);
			if (user) {
				if (!user.home) {
					process.stdout.write(user._id + 'u ');
					var fields = {
						//$unset: { favCnt: 1 },
						$set: { home: user.name }
					};
					mongo.users.update({ _id: user._id }, fields, function (err) {
						if (err) return next(err);
						setImmediate(read);
					});
				} else {
					process.stdout.write(user._id + 's ');
					setImmediate(read);
				}
				return;
			}
			next();
		});
	}
	read();
});

init.run(function (err) {
	if (err) throw err;
	console.log();
	mongo.db.close();
});
