var init = require('../lang/init');
var config = require('../config/config')({ parseArg: true });
var mongo = require('../mongo/mongo');

init.add(function (next) {
	var cursor = mongo.images.find();
	function read() {
		cursor.nextObject(function (err, image) {
			if (err) return next(err);
			if (image) {
				process.stdout.write(image._id + ' ');
				process.stdout.write(image.vers + ' ');
				process.stdout.write('\n');
				setImmediate(read);
				return;
			}
			next();
		});
	}
	read();
});

init.run(function (err) {
	if (err) throw err;
	mongo.db.close();
});
