var init = require('../lang/init');
var config = require('../config/config')({ parseArg: true });
var mongo = require('../mongo/mongo');

init.add(function (next) {
	if (config.argv.length < 2) {
		console.log('\nspecify email.');
		return next();
	}
	mongo.users.update({ email: config.argv[1] }, { $set: { admin: true } }, next);
});

init.run(function (err) {
	mongo.db.close();
	if (err) throw err;
});