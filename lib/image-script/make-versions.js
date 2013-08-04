var fs = require('fs');

var init = require('../lang/init');
var config = require('../config/config')({ parseArg: true });
var mongo = require('../mongo/mongo');
var imagel = require('../image/image');

init.add(function (next) {
	console.log('start rendering.');

	var cursor = mongo.images.find();
	function read() {
		cursor.nextObject(function (err, image) {
			if (err) return next(err);
			if (image) {
				var id = image._id;
				var dir = imagel.getImageDir(id);
				imagel.removeVersions(dir, function (err) {
					if (err) return next(err);
					var org = imagel.getOriginalPath(dir, id, image.format);
					process.stdout.write(id + ' ');
					imagel.makeVersions(id, dir, org, image.width, function (err, vers) {
						if (err) return next(err);
						var fields = {
							$set : { vers: vers }
						}
						mongo.images.update({ _id: id }, fields, function (err) {
							if (err) return next(err);
							setImmediate(read);
						});
					});
				});
				return;
			}
			console.log('done.');
			next();
		});
	}
	read();
});

init.run(function (err) {
	if (err) throw err;
	mongo.db.close();
});
