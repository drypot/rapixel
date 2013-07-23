var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;

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

var _vers = [
	{ width:5120, height: 2880 },
	{ width:3840, height: 2160 },
	{ width:2880, height: 1620 },
	{ width:2560, height: 1440 },
	{ width:2048, height: 1152 },
	{ width:1920, height: 1080 },
	{ width:1680, height: 945 },
	{ width:1440, height: 810 },
	{ width:1366, height: 768 },
	{ width:1280, height: 720 },
	{ width:1136, height: 639 },
	{ width:1024, height: 576 },
	{ width:960 , height: 540 },
	{ width:640 , height: 360 }
];

init.add(function (next) {

	console.log('photo:');

	exports.getPhotoDir = function (id) {
		return fs2.makeDeepPath(upload.photoDir, id, 3);
	};

	exports.getOrginalPath = function (dir, id, format) {
		return dir + '/' + id + '-org.' + format;
	}

	exports.getVersionPath = function (dir, id, width) {
		return dir + '/' + id + '-' + width + '.jpg';
	};

	exports.identify = function (fname, next) {
		exec('identify -format "%m %w %h" ' + fname, function (err, stdout, stderr) {
			if (err) return next(err);
			var a = stdout.split(/[ \n]/);
			var meta = {
				format: a[0].toLowerCase(),
				width: parseInt(a[1]) || 0,
				height: parseInt(a[2]) || 0
			};
			next(null, meta);
		});
	};

	exports.makeVersions = function (org, width, dir, id, next) {
		var cmd = 'convert ' + org;
		cmd += ' -quality 92';
		cmd += ' -gravity center';

		var i = 0;
		var vers = [];
		for (; i < _vers.length; i++) {
			if (_vers[i].width < width + 15) {
				break;
			}
		}
		for (; i < _vers.length; i++) {
			var dim = _vers[i];
			vers.push(dim.width);
			cmd += ' -resize ' + dim.width + 'x' + dim.height + '^'
			cmd += ' -crop ' + dim.width + 'x' + dim.height + '+0+0'
			cmd	+= ' +repage'
			if (i == _vers.length - 1) {
				cmd += ' ' + exports.getVersionPath(dir, id, dim.width);
			} else {
				cmd += ' -write ' + exports.getVersionPath(dir, id, dim.width);
			}
		}
		exec(cmd, function (err) {
			next(err, vers);
		});
	};

	exports.removeVersions = function (dir, next) {
		fs.readdir(dir, function (err, fnames) {
			if (err) return next(err);
			var i = 0;
			function unlink() {
				if (i == fnames.length) {
					return next();
				}
				var fname = fnames[i++];
				if (~fname.indexOf('org')) {
					//console.log('preserve ' + dir + '/' + fname);
					setImmediate(unlink);
				} else {
					//console.log('delete ' + dir + '/' + fname);
					fs.unlink(dir + '/' + fname, function (err) {
						if (err && err.code !== 'ENOENT') return next(err);
						setImmediate(unlink);
					});
				}
			}
			unlink();
		});
	}

	exports.findHours = function(user, now, next) {
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
		if (!form.file) {
			return next(error(ecode.PHOTO_NO_FILE));
		}
		exports.findHours(user, form.now, function (err, hours) {
			if (err) return next(err);
			if (hours > 0) {
				return next(error(ecode.PHOTO_CYCLE));
			}
			checkPhotoMeta(form, function (err, meta) {
				if (err) return next(err);
				var id = mongo.newPhotoId();
				var dir = exports.getPhotoDir(id);
				fs2.makeDirs(dir, function (err) {
					if (err) return next(err);
					var org = exports.getOrginalPath(dir, id, meta.format);
					fs.rename(form.file.tpath, org, function (err) {
						if (err) return next(err);
						exports.makeVersions(org, meta.width, dir, id, function (err, vers) {
							if (err) return next(err);
							var photo = {
								_id: id,
								uid: user._id,
								hit: 0,
								fname: form.file.oname,
								format: meta.format,
								width: meta.width,
								height: meta.height,
								vers: vers,
								comment: form.comment,
								cdate: form.now
							};
							mongo.insertPhoto(photo, function (err) {
								if (err) return next(err);
								next(null, id);
							});
						});
					});
				});
			});
		});
	};

	function checkPhotoMeta(form, next) {
		exports.identify([form.file.tpath], function (err, meta) {
			if (err) {
				return next(error(ecode.PHOTO_TYPE))
			}
			if (meta.width < 3840 - 15 || meta.height < 2160 - 15 ) {
				return next(error(ecode.PHOTO_SIZE));
			}
			next(null, meta);
		});
	}

	exports.checkUpdatable = function (id, user, next) {
		mongo.findPhoto(id, function (err, photo) {
			if (err) return next(err);
			if (!photo) {
				return next(error(ecode.PHOTO_NOT_EXIST));
			}
			if (!user.admin && photo.uid != user._id) {
				return next(error(ecode.NOT_AUTHORIZED));
			}
			next(null, photo);
		});
	}

	exports.updatePhoto = function(id, form, _next) {
		var next = upload.tmpDeleter(form.files, _next);
		if (form.file) {
			checkPhotoMeta(form, function (err, meta) {
				if (err) return next(err);
				var dir = exports.getPhotoDir(id);
				fs2.removeDirs(dir, function (err) {
					if (err) return next(err);
					fs2.makeDirs(dir, function (err) {
						if (err) return next(err);
						var org = exports.getOrginalPath(dir, id, meta.format);
						fs.rename(form.file.tpath, org, function (err) {
							if (err) return next(err);
							exports.makeVersions(org, meta.width, dir, id, function (err, vers) {
								if (err) return next(err);
								var fields = {
									fname: form.file.oname,
									format: meta.format,
									width: meta.width,
									height: meta.height,
									vers: vers,
									comment: form.comment
								}
								mongo.updatePhotoFields(id, fields, next);
							});
						});
					});
				});
			});
		} else {
			var fields = {
				comment: form.comment
			};
			mongo.updatePhotoFields(id, fields, next);
		}
	};

	exports.delPhoto = function (id, next) {
		mongo.delPhoto(id, function (err, cnt) {
			if (err) return next(err);
			fs2.removeDirs(exports.getPhotoDir(id), function (err) {
				if (err) return next(err);
				next();
			});
		});
	};

	var photoUrl = config.data.uploadUrl + '/photo';

	exports.incHit = function (id, next) {
		mongo.updatePhotoHit(id, next);
	}

	exports.findPhoto = function (id, next) {
		mongo.findPhoto(id, function (err, photo) {
			if (err) return next(err);
			if (!photo) return next(error(ecode.PHOTO_NOT_EXIST));
			userl.findCachedUser(photo.uid, function (err, user) {
				if (err) return next(err);
				photo.user = {
					_id: user._id,
					name: user.name,
					home: user.home
				};
				photo.dir = fs2.makeDeepPath(photoUrl, photo._id, 3);
				photo.cdateStr = dt.format(photo.cdate);
				photo.cdate = photo.cdate.getTime();
				next(null, photo);
			});
		});
	};

	exports.makeListParams = function (req, query) {
		var params = {};
		params.query = query;
		params.lt = parseInt(req.query.lt) || 0;
		params.gt = params.lt ? 0 : parseInt(req.query.gt) || 0;
		params.ps = parseInt(req.query.ps) || 16;
		return params;
	}

	exports.findPhotos = function (params, next) {
		mongo.findPaged(mongo.photos, params.query, params.gt, params.lt, params.ps, function (photo, next) {
			userl.findCachedUser(photo.uid, function (err, user) {
				if (err) return next(err);
				photo.user = {
					_id: user._id,
					name: user.name,
					home: user.home
				};
				photo.dir = fs2.makeDeepPath(photoUrl, photo._id, 3);
				photo.cdateStr = dt.format(photo.cdate);
				next(null, photo);
			});
		}, next);
	}

	next();
});
