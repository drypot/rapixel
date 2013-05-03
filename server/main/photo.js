var fs = require('fs');
var path = require('path');
var img = require('imagemagick');

var init = require('../main/init');
var config = require('../main/config');
var fs2 = require('../main/fs');
var mongo = require('../main/mongo');
var upload = require('../main/upload');
var error = require('../main/error');

init.add(function (next) {

	console.log('photo:');

	var vers = [ 2160, 1440, 1080, 720, 480, 320 ];

	exports.createPhoto = function(req, user, _next) {
		var next = upload.tmpDeleter(req.files.file, _next);
		if (user.pdate && ((Date.now() - user.pdate.getTime()) / (24 * 60 * 60 * 1000) < 1 )) {
			return next(error(error.PHOTO_CYCLE));
		}

		// TODO: free space check

		var file = req.files.file;
		if (!file) {
			return next(error(error.PHOTO_NO_FILE));
		}
		if (Array.isArray(file)) {
			return next(error(error.PHOTO_NOT_ONE));
		}
		img.identify(file.path, function (err, f) {
			if (err) return next(err);
			if (f.height < 1440) {
				return next(error(error.PHOTO_HEIGHT));
			}
			if (f.width / f.height < 1.75) {
				return next(error(error.PHOTO_RATIO));
			}
			var photoId = mongo.getNewPhotoId();
			var path =

			next();
		});
		req.user()
	}


	function dir(photoId) {
		var path = upload.pub + '/photo/';
		path += Math.floor(postId / 1000000000) + '/';
		path += Math.floor((postId % 1000000000) / 1000000) + '/';
		path += Math.floor((postId % 1000000) / 1000) + '/';
		path += postId;
		return path;
	}

	exports.postFileUrl = function (postId, fname) {
		return config.data.uploadUrl + '/post/' + Math.floor(postId / 10000) + '/' + postId + '/' + encodeURIComponent(fname);
	}

	exports.postFileExists = function (postId, filename) {
		return fs.existsSync(exports.postFileDir(postId) + '/' + filename);
	};

	exports.savePostFiles = function (postId, files, next) {
		if (!files || files.length == 0) {
			return next();
		}
		saveTmpFiles(files, [pub, 'post', Math.floor(postId / 10000), postId], next);
	};

	function saveTmpFiles(files, subs, next) {
		try {
			var tarDir = fs2.mkdirs(subs);
			var saved = [];
			for (var i = 0; i < files.length; i++) {
				var file = files[i];
				var safeName = fs2.safeFilename(path.basename(file.name));
				var tmpName = path.basename(file.tmpName);
				try {
					fs.renameSync(tmp + '/' + tmpName, tarDir + '/' + safeName);
				} catch (err) {
					if (err.code !== 'ENOENT') next(err);
				}
				saved.push({ name: safeName });
			}
			next(null, saved);
		} catch (err) {
			next(err);
		}
	}

	exports.deletePostFiles = function (postId, files, next) {
		if (!files || files.length == 0) {
			return next();
		}
		deleteFiles(files, exports.postFileDir(postId), next);
	};

	function deleteFiles(files, dir, next) {
		try {
			var deleted = [];
			files.forEach(function (file) {
				var name = path.basename(file)
				var p = dir + '/' + name;
//				console.log('deleting: ' + p);
				try {
					fs.unlinkSync(p);
				} catch (err) {
					if (err.code !== 'ENOENT') next(err);
				}
				deleted.push(name);
			});
			next(null, deleted);
		} catch (err) {
			next(err);
		}
	}

	next();
});
