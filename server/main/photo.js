var fs = require('fs');
var path = require('path');
var img = require('imagemagick');

var init = require('../main/init');
var config = require('../main/config');
var fs2 = require('../main/fs');
var mongo = require('../main/mongo');
var user = require('../main/user');
var upload = require('../main/upload');
var error = require('../main/error');

init.add(function (next) {

	console.log('photo:');

	exports.checkCycle = function(u, now, next) {
//		사진을 삭제하고 다시 업하는 경우를 허용하도록 한다.
//		if (user.pdate && ((Date.now() - user.pdate.getTime()) / (24 * 60 * 60 * 1000) < 1 )) {
//			return next(error(error.PHOTO_CYCLE));
//		}

		mongo.findLastPhoto(u._id, function (err, p) {
			if (err) return next(err);
			if (p) {
				var hours = (now - p.cdate.getTime()) / (60 * 60 * 1000);
				if (hours < 24) {
					return next(error({ rc: error.PHOTO_CYCLE, hours: hours }));
				}
			}
			next();
		});
	}

	exports.createPhoto = function(req, u, _next) {
		var next = upload.tmpDeleter(req.files.file, _next);
		var now = new Date();
		exports.checkCycle(u, now, function (err) {
			if (err) return next(err);
			checkPhoto(req, u, function (err, f) {
				if (err) return next(err);
				var photoId = mongo.newPhotoId();
				makeVersions(req, photoId, f, function (err, vers, org) {
					if (err) return next(err);
					var p = {
						_id: photoId,
						userId: u._id,
						hit: 0,
						favCnt: 0,
						fname: path.basename(req.files.file.name),
						format: f.format,
						width: f.width,
						height: f.height,
						vers: vers,
						cdate: now,
						comment: req.body.comment || ''
					};
					mongo.insertPhoto(p, function (err) {
						if (err) return next(err);
						mongo.updateUserPdate(u._id, now, function (err) {
							if (err) return next(err);
							next(null, photoId);
						});
					});
				});
			});
		});
	};

	var _vers = [ 2160, 1440, 1080, 720, 480, 320 ];

	function makeVersions(req, pid, f, next) {
		fs2.mkdirs(upload.pub, 'photo', fs2.subs(pid, 3), function (err, p) {
			if (err) return next(err);
			var vers = [];
			var i = 0;
			function makeVersion() {
				if (i == _vers.length) {
					var org = 'org.' + f.format.toLowerCase();
					fs.rename(req.files.file.path, p + '/' + org, function (err) {
						if (err) return next(err);
						next(null, vers);
					})
				}
				var v = _vers[i++];
				if (v > f.height) {
					setImmediate(makeVersion);
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
					setImmediate(makeVersion);
				});
			}
			makeVersion();
		});
	}

	function checkPhoto(req, u, next) {
		var file = req.files.file;
		if (!file) {
			return next(error(error.PHOTO_NO_FILE));
		}
		if (Array.isArray(file)) {
			return next(error(error.PHOTO_NOT_ONE));
		}
		img.identify(file.path, function (err, f) {
			if (err) {
				err.rc = error.PHOTO_TYPE;
				err.message = error.msg[error.PHOTO_TYPE];
				return next(err);
			}
			if (f.height < 2160) {
				return next(error(error.PHOTO_HEIGHT));
			}
			if (f.width / f.height < 1.75) {
				return next(error(error.PHOTO_RATIO));
			}
			next(null, f);
		});
	}

	exports.findPhoto = function (pid, next) {
		mongo.findPhoto(pid, function (err, p) {
			if (err) return next(err);
			user.cachedUser(p.userId, function (err, u) {
				if (err) return next(err);
				p.user = {
					_id: u._id,
					name: u.name
				};
				next(null, p);
			});
		});
	};

	exports.del = function (pid, u, next) {
		mongo.delPhoto(pid, u.admin ? null : u._id, function (err, cnt) {
			if (err) return next(err);
			if (!cnt) return next(error(error.PHOTO_NOTHING_TO_DEL));
			fs2.rmAll(exports.photoPath(pid), function (err) {
				if (err) return next(err);
				next();
			});
		});
	};

	exports.list = function (pg, pgsize, next) {
		var cursor = mongo.findPhotos(pg, pgsize);
		var photos = [];
		var count = 0;
		function read() {
			cursor.nextObject(function (err, p) {
				if (err) return next(err);
				if (!p) return next(null, photos, count !== pgsize);
				user.cachedUser(p.userId, function (next, u) {
					if (err) return next(err);
					p.user = {
						_id: u._id,
						name: u.name
					};
					photos.push(p);
					count++;
					setImmediate(read);
				});
			});
		}
		read();
	};

	exports.photoPath = function (pid) {
		return upload.pub + '/photo/' + fs2.subs(pid, 3).join('/');
	}

	next();
});
