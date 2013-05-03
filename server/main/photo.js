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

	exports.createPhoto = function(req, user, _next) {
		var next = upload.tmpDeleter(req.files.file, _next);
		checkPhoto(req, user, function (err, f) {
			if (err) return next(err);
			var photoId = mongo.getNewPhotoId();
			makeVersions(req, photoId, f, function (err, vers, org) {
				if (err) return next(err);
				var now = new Date();
				var photo = {
					_id: photoId,
					hit: 0,
					favCnt: 0,
					userId: user._id,
					fname: path.basename(req.files.file.name),
					format: f.format,
					width: f.width,
					height: f.height,
					vers: vers,
					cdate: now,
					comment: req.body.comment || ''
				};
				mongo.insertPhoto(photo, function (err) {
					if (err) return next(err);
					mongo.updateUserPdate(user._id, now, function (err) {
						if (err) return next(err);
						next(null, photoId);
					});
				});
			})
		});
	}

	var _vers = [ 2160, 1440, 1080, 720, 480, 320 ];

	function makeVersions(req, photoId, f, next) {
		fs2.mkdirs(upload.pub, 'photo', fs2.subs(photoId, 3), function (err, p) {
			if (err) return next(err);
			var vers = [];
			var i = 0;
			function makeVers() {
				if (i == _vers.length) {
					var org = 'org.' + f.format.toLowerCase();
					fs.rename(req.files.file.path, p + '/' + org, function (err) {
						if (err) return next(err);
						next(null, vers);
					})
				}
				var v = _vers[i++];
				if (v > f.height) {
					setImmediate(makeVers);
					return;
				}
				var opt = {
					srcPath: req.files.file.path,
					dstPath: p + '/' + v + '.jpg',
					quality: f.format === 'JPEG' ? 0.92 : f.format === 'PNG' ? 0.89 : 0.8,
					sharpening: 0,
					height: v
				};
				img.resize(opt, function (err) {
					if (err) return next(err);
					vers.push(v);
					setImmediate(makeVers);
				});
			}
			makeVers();
		});
	}

	function checkPhoto(req, user, next) {
		if (user.pdate && ((Date.now() - user.pdate.getTime()) / (24 * 60 * 60 * 1000) < 1 )) {
			return next(error(error.PHOTO_CYCLE));
		}
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
			next(null, f);
		});
	}

	next();
});
