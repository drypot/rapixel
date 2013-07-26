var init = require('../lang/init');
var config = require('../config/config')({ argv: true });
var mongo = require('../mongo/mongo');

init.add(function (next) {
	var cursor = mongo.photos.find();
	function read() {
		cursor.nextObject(function (err, photo) {
			if (err) return next(err);
			if (photo) {
				process.stdout.write(photo._id + ' ');
				var fields = {
					$unset: { favCnt: 1 },
					$set: { format: photo.format.toLowerCase() }
				};
				mongo.photos.update({ _id: photo._id }, fields, function (err) {
					if (err) return next(err);
					setImmediate(read);
				});
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
