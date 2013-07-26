var init = require('../lang/init');
var config = require('../config/config')({ argv: true });
var mongo = require('../mongo/mongo');

init.add(function (next) {
	if (!config.argv.length) {
		console.log('\nspecify email.');
		return next();
	}
	mongo.users.update({ email: config.argv[0] }, { $set: { admin: true } }, next);
});

init.run(function (err) {
	mongo.db.close();
	if (err) throw err;
});
