var init = require('../main/init');
var config = require('../main/config')({ argv: true });
var mongo = require('../main/mongo');

init.add(function (next) {
	var cursor = mongo.photos.find();
	function read() {
		cursor.nextObject(function (err, photo) {
			if (err) return next(err);
			if (photo) {
				process.stdout.write(photo._id + ' ');
				process.stdout.write(photo.vers + ' ');
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
