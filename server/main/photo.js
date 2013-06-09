var fs = require('fs');
var path = require('path');
var img = require('imagemagick');

var l = require('../main/l');
var init = require('../main/init');
var config = require('../main/config');
var fs2 = require('../main/fs');
var dt = require('../main/dt');
var mongo = require('../main/mongo');
var userl = require('../main/user');
var upload = require('../main/upload');
var error = require('../main/error');
var ecode = require('../main/ecode');

init.add(function (next) {

	console.log('photo:');

	exports.getPage = function(_pg) {
		var pg = parseInt(_pg) || 1;
		return pg < 1 ? 1 : pg;
	};

	exports.getPageSize = function (ps) {
		var pgsize = parseInt(ps) || 16;
		return pgsize > 64 ? 64 : pgsize < 1 ? 1 : pgsize;
	};

	exports.findHours = function(user, now, next) {
//		사진을 삭제하고 다시 업하는 경우를 허용하도록 한다.
//		if (user.pdate && ((Date.now() - user.pdate.getTime()) / (18 * 60 * 60 * 1000) < 1 )) {
//			return next(error(ecode.PHOTO_CYCLE));
//		}
		mongo.findLastPhoto(user._id, function (err, photo) {
			if (err) return next(err);
			var hours = 0;
			if (photo) {
				hours = 18 - Math.floor((now.getTime() - photo.cdate.getTime()) / (60 * 60 * 1000));
				hours = hours < 0 ? 0 : hours;
			}
			next(null, hours);
		});
	};

	exports.makeForm = function (req) {
		var form = {};
		form.now = new Date();
		form.comment = req.body.comment || '';
		form.files = upload.normalizeFiles(req.body.files);
		form.file = form.files[0];
		return form;
	}

	exports.createPhoto = function(user, form, _next) {
		var next = upload.tmpDeleter(form.files, _next);
		exports.findHours(user, form.now, function (err, hours) {
			if (err) return next(err);
			if (hours > 0) {
				return next(error(ecode.PHOTO_CYCLE));
			}
			checkPhotoFile(form, function (err) {
				if (err) return next(err);
				checkPhotoFeature(form, function (err, feature) {
					if (err) return next(err);
					var id = mongo.newPhotoId();
					makeVersions(id, form, feature, function (err, vers) {
						if (err) return next(err);
						var photo = {
							_id: id,
							uid: user._id,
							hit: 0,
							favCnt: 0,
							fname: form.file.oname,
							format: feature.format,
							width: feature.width,
							height: feature.height,
							vers: vers,
							cdate: form.now,
							comment: form.comment
						};
						mongo.insertPhoto(photo, function (err) {
							if (err) return next(err);
							mongo.updateUserPdate(user._id, form.now, function (err) {
								if (err) return next(err);
								next(null, id);
							});
						});
					});
				});
			});
		});
	};

	exports.updatePhoto = function(user, form, _next) {
		var next = upload.tmpDeleter(form.files, _next);
		if (form.file) {
			checkPhotoFeature(form, function (err, feature) {
				if (err) return next(err);
				var id = mongo.newPhotoId();
				makeVersions(id, form, feature, function (err, vers) {
					if (err) return next(err);
					var photo = {
						_id: id,
						uid: user._id,
						hit: 0,
						favCnt: 0,
						fname: form.file.oname,
						format: feature.format,
						width: feature.width,
						height: feature.height,
						vers: vers,
						cdate: form.now,
						comment: form.comment
					};
					mongo.insertPhoto(photo, function (err) {
						if (err) return next(err);
						mongo.updateUserPdate(user._id, form.now, function (err) {
							if (err) return next(err);
							next(null, id);
						});
					});
				});
			});
		}
	};

	function checkPhotoFile(form, next) {
		if (!form.file) {
			return next(error(ecode.PHOTO_NO_FILE));
		}
		if (form.files.length > 1) {
			return next(error(ecode.PHOTO_NOT_ONE));
		}
		next();
	}

	function checkPhotoFeature(form, next) {
		img.identify(form.file.tpath, function (err, feature) {
			if (err) {
				return next(error(ecode.PHOTO_TYPE))
			}
			if (feature.height < 2160) {
				return next(error(ecode.PHOTO_HEIGHT));
			}
			var ratio = feature.width / feature.height;
			if (ratio < 1.75 || ratio > 1.79) {
				return next(error(ecode.PHOTO_RATIO));
			}
			feature.formatLowerCase = feature.format.toLowerCase();
			next(null, feature);
		});
	}

	exports.getPhotoPath = function (id, fname) {
		if (fname) {
			return fs2.makeDeepPath(upload.photoDir, id, 3) + '/' + fname;
		}
		return fs2.makeDeepPath(upload.photoDir, id, 3);
	}

	var _vers = [ 2160, 1440, 1080, 720, 480, 320 ];

	function makeVersions(id, form, feature, next) {
		var file = form.file;
		fs2.makeDirs(exports.getPhotoPath(id), function (err, ppath) {
			if (err) return next(err);
			var vers = [];
			var i = 0;
			function makeVersion() {
				if (i == _vers.length) {
					var org = ppath + '/' + id + '-org.' + feature.formatLowerCase;
					fs.rename(file.tpath, org, function (err) {
						if (err) return next(err);
						next(null, vers);
					});
					return;
				}
				var v = _vers[i++];
				if (v > feature.height) {
					setImmediate(makeVersion);
					return;
				}
				var opt = {
					srcPath: file.tpath,
					dstPath: ppath + '/' + id + '-' + v + '.jpg',
					quality: feature.format === 'JPEG' ? 0.92 : feature.format === 'PNG' ? 0.89 : 0.8,
					sharpening: 0,
					height: v,
					format: 'jpg'
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

	var photoUrl = config.data.uploadUrl + '/photo';

	exports.findPhoto = function (id, next) {
		mongo.updatePhotoHit(id, function (err) {
			if (err) return next(err);
			mongo.findPhoto(id, function (err, photo) {
				if (err) return next(err);
				if (!photo) return next(error(ecode.PHOTO_NOTHING_TO_SHOW));
				userl.findCachedUser(photo.uid, function (err, user) {
					if (err) return next(err);
					photo.user = {
						_id: user._id,
						name: user.name,
						footer: user.footer
					};
					photo.dir = fs2.makeDeepPath(photoUrl, photo._id, 3);
					photo.cdateStr = dt.format(photo.cdate);
					photo.cdate = photo.cdate.getTime();
					next(null, photo);
				});
			});
		});
	};

	exports.delPhoto = function (id, user, next) {
		checkUpdatable(id, user, function (err) {
			if (err) return next(err);
			mongo.delPhoto(id, function (err, cnt) {
				if (err) return next(err);
				fs2.removeDirs(exports.getPhotoPath(id), function (err) {
					if (err) return next(err);
					next();
				});
			});
		});
	};

	function checkUpdatable(id, user, next) {
		mongo.findPhoto(id, function (err, photo) {
			if (err) return next(err);
			if (!photo) {
				return next(error(ecode.PHOTO_NOTHING_TO_DEL));
			}
			if (!user.admin && photo.uid != user._id) {
				return next(error(ecode.NOT_AUTHORIZED));
			}
			next();
		});
	}

	exports.findPhotos = function (pg, ps, next) {
		var cursor = mongo.findPhotos(pg, ps);
		var photos = [];
		var count = 0;
		function read() {
			cursor.nextObject(function (err, photo) {
				if (err) return next(err);
				if (photo) {
					userl.findCachedUser(photo.uid, function (next, user) {
						if (err) return next(err);
						photo.user = {
							_id: user._id,
							name: user.name
						};
						photo.dir = fs2.makeDeepPath(photoUrl, photo._id, 3);
						photo.cdateStr = dt.format(photo.cdate);
						photos.push(photo);
						count++;
						setImmediate(read);
					});
					return;
				}
				next(null, photos, count !== ps);
			});
		}
		read();
	};

	exports.findPhotosByUser = function (uid, pg, ps, next) {
		var cursor = mongo.findPhotosByUser(uid, pg, ps);
		var photos = [];
		var count = 0;
		function read() {
			cursor.nextObject(function (err, photo) {
				if (err) return next(err);
				if (photo) {
					photo.dir = fs2.makeDeepPath(photoUrl, photo._id, 3);
					photo.cdateStr = dt.format(photo.cdate);
					photos.push(photo);
					count++;
					setImmediate(read);
					return;
				}
				next(null, photos, count !== ps);
			});
		}
		read();
	};

	next();
});
