var fs = require('fs');

var init = require('../main/init');
var config = require('../main/config')({ argv: true });
var mongo = require('../main/mongo');
var photol = require('../main/photo');

init.add(function (next) {
	console.log('start rendering.');

	var cursor = mongo.photos.find();
	function read() {
		cursor.nextObject(function (err, photo) {
			if (err) return next(err);
			if (photo) {
				var id = photo._id;
				var dir = photol.getPhotoDir(id);
				photol.removeVersions(dir, function (err) {
					if (err) return next(err);
					var org = photol.getOrginalPath(dir, id, photo.format);
					process.stdout.write(id + ' ');
					photol.makeVersions(org, photo.width, dir, id, function (err, vers) {
						if (err) return next(err);
						var fields = {
							$set : { vers: vers }
						}
						mongo.photos.update({ _id: id }, fields, function (err) {
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
