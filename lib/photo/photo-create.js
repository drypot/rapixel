var fs = require('fs');
var path = require('path');

var lang = require('../lang/lang');
var init = require('../lang/init');
var config = require('../config/config');
var fs2 = require('../fs/fs');
var dt = require('../lang/dt');
var mongo = require('../mongo/mongo');
var express = require('../express/express');
var usera = require('../user/user-auth');
var upload = require('../upload/upload');
var error = require('../error/error');
var ecode = require('../error/ecode');

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

	var photos;
	var photoIdSeed;

		var opt = {
			fields: { _id: 1 },
			sort: { _id: -1 },
			limit: 1
		};
		photos.find({}, opt).nextObject(function (err, obj) {
			if (err) return next(err);
			photoIdSeed = obj ? obj._id : 0;
			console.log('mongo: photo id seed = ' + photoIdSeed);
			next();
		});

	app.post('/api/photos', function (req, res) {
		usera.getUser(res, function (err, user) {
			if (err) return res.jsonErr(err);
			var form = photol.makeForm(req.body);
			photol.createPhoto(user, form, function (err, id) {
				if (err) return res.jsonErr(err);
				res.json({
					photo: {
						_id: id
					}
				});
			});
		});
	});


	app.get('/photos/new', function (req, res) {
		usera.getUser(res, function (err, user) {
			if (err) return res.renderErr(err);
			var now = new Date();
			photol.findHours(user, now, function (err, hours) {
				res.render('photo-new', {
					hours: hours
				});
			});
		});
	});


	exports.newPhotoId = function () {
		return ++photoIdSeed;
	};

	exports.insertPhoto = function (photo, next) {
		photos.insert(photo, next);
	};



		exports.findLastPhoto = function (uid, next) {
		var opt = {
			fields: { cdate: 1 },
			sort: { uid: 1, _id: -1 }
		}
		photos.findOne({ uid: uid }, opt, next);
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
	var next = upload.deleter(form.files, _next);
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
				var org = exports.getOriginalPath(dir, id, meta.format);
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


