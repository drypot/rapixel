var fs = require('fs');

var init = require('../main/init');
var config = require('../main/config')({ parseArgv: true });
var mongo = require('../main/mongo');
var photol = require('../main/photo');
var magick = require('../main/magick');

init.add(function (next) {
	console.log('start rendering.');

	var cursor = mongo.photos.find();
	function read() {
		cursor.nextObject(function (err, photo) {
			if (err) return next(err);
			if (photo) {
				var dir = photol.getPhotoPath(photo._id);
				emptyDir(dir, function (err) {
					if (err) return next(err);
					var org = dir + '/' + photo._id + '-org.' + photo.format;
					console.log('rendering ' + photo._id);
					magick.makeVersions(org, photo.width, dir, photo._id, function (err, vers) {
						if (err) return next(err);
						var fields = {
							$set : { vers: vers }
						}
						mongo.photos.update({ _id: photo._id }, fields, function (err) {
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

	function emptyDir(dir, next) {
		fs.readdir(dir, function (err, fnames) {
			if (err) return next(err);
			var i = 0;
			function unlink() {
				if (i == fnames.length) {
					return next();
				}
				var fname = fnames[i++];
				remove(dir, fname, function (err) {
					if (err) return next(err);
					setImmediate(unlink);
				});
			}
			unlink();
		});
	}

	function remove(dir, fname, next) {
		if (~fname.indexOf('org')) {
			console.log('preserve ' + dir + '/' + fname);
			next();
		} else {
			console.log('delete ' + dir + '/' + fname);
			fs.unlink(dir + '/' + fname, function (err) {
				if (err && err.code !== 'ENOENT') return next(err);
				next();
			});
		}
	}

});

init.run(function (err) {
	if (err) throw err;
	mongo.db.close();
});
