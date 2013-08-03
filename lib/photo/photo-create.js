var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;

var init = require('../lang/init');
var config = require('../config/config');
var fs2 = require('../fs/fs');
var mongo = require('../mongo/mongo');
var express = require('../express/express');
var usera = require('../user/user-auth');
var upload = require('../upload/upload');
var photob = require('../photo/photo-base');
var error = require('../error/error');
var ecode = require('../error/ecode');

var photoc = exports;

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

var seed;

init.add(function (next) {
	var opt = {
		fields: { _id: 1 },
		sort: { _id: -1 },
		limit: 1
	};
	mongo.photos.find({}, opt).nextObject(function (err, obj) {
		if (err) return next(err);
		seed = obj ? obj._id : 0;
		console.log('photo-create: id seed = ' + seed);
		next();
	});
});

init.add(function () {
	var app = express.app;

	app.post('/api/photos', function (req, res) {
		usera.getUser(res, function (err, user) {
			if (err) return res.jsonErr(err);
			var form = photoc.getForm(req.body);
			photoc.createPhotos(form, user, function (err, ids) {
				if (err) return res.jsonErr(err);
				res.json({
					ids: ids
				});
			});
		});
	});

	app.get('/photos/new', function (req, res) {
		usera.getUser(res, function (err, user) {
			if (err) return res.renderErr(err);
			var now = new Date();
			photol.getTicketCount(now, user, function (err, count, hours) {
				res.render('photo-new', {
					count: count,
					hours: hours
				});
			});
		});
	});
});

photoc.newPhotoId = function () {
	return ++seed;
};

photoc.getForm = function (body) {
	var form = {};
	form.now = new Date();
	form.comment = body.comment || '';
	form.files = upload.normalizeFiles(body.files);
	return form;
}

photoc.createPhotos = function(form, user, _next) {
	var next = upload.deleter(form.files, _next);
	if (!form.files.length) {
		return next(error(ecode.PHOTO_NO_FILE));
	}
	var i = 0;
	var ids = [];
	function create() {
		if (i == form.files.length) {
			return next(null, ids);
		}
		var file = form.files[i++];
		photoc.getTicketCount(form.now, user, function (err, count, hours) {
			if (err) return next(err);
			if (!count) {
				return next(null, ids);
			}
			createOne(form, file, user, function (err, id) {
				if (err) return next(err);
				ids.push(id);
				setImmediate(create);
			});
		});
	}
	create();
};

function createOne(form, file, user, next) {
	photoc.checkPhotoMeta(file, function (err, meta) {
		if (err) return next(err);
		var id = photoc.newPhotoId();
		var dir = photob.getPhotoDir(id);
		fs2.makeDirs(dir, function (err) {
			if (err) return next(err);
			var org = photob.getOriginalPath(dir, id, meta.format);
			fs.rename(file.tpath, org, function (err) {
				if (err) return next(err);
				photoc.makeVersions(id, dir, org, meta.width, function (err, vers) {
					if (err) return next(err);
					var photo = {
						_id: id,
						uid: user._id,
						hit: 0,
						fname: file.oname,
						format: meta.format,
						width: meta.width,
						height: meta.height,
						vers: vers,
						comment: form.comment,
						cdate: form.now
					};
					mongo.photos.insert(photo, function (err) {
						if (err) return next(err);
						next(null, id);
					});
				});
			});
		});
	});
}

photoc.getTicketCount = function(now, user, next) {
	var count = config.data.ticketMax;
	var hours;
	var opt = {
		fields: { cdate: 1 },
		sort: { uid: 1, _id: -1 },
		limit: config.data.ticketMax
	}
	mongo.photos.find({ uid: user._id }, opt).toArray(function (err, photos) {
		if (err) return next(err);
		for (var i = 0; i < photos.length; i++) {
			hours = config.data.ticketGenInterval - Math.floor((now.getTime() - photos[i].cdate.getTime()) / (60 * 60 * 1000));
			if (hours > 0) {
				count--;
			} else {
				break;
			}
		}
		next(null, count, hours);
	});
};

photoc.checkPhotoMeta = function (file, next) {
	photoc.identify([file.tpath], function (err, meta) {
		if (err) {
			return next(error(ecode.PHOTO_TYPE))
		}
		if (meta.width < 3840 - 15 || meta.height < 2160 - 15 ) {
			return next(error(ecode.PHOTO_SIZE));
		}
		next(null, meta);
	});
}

photoc.identify = function (fname, next) {
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

photoc.makeVersions = function (id, dir, org, width, next) {
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
			cmd += ' ' + photob.getVersionPath(dir, id, dim.width);
		} else {
			cmd += ' -write ' + photob.getVersionPath(dir, id, dim.width);
		}
	}
	exec(cmd, function (err) {
		next(err, vers);
	});
};


