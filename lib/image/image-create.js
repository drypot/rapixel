var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;

var init = require('../lang/init');
var config = require('../config/config');
var fs2 = require('../fs/fs');
var mongo = require('../mongo/mongo');
var express = require('../express/express');
var upload = require('../upload/upload');
var usera = require('../user/user-auth');
var error = require('../error/error');

var imagec = exports;

var _ver;
var seed;

init.add(function (next) {
	_vers = config.versions;
	imagec.imageDir = config.uploadDir + '/public/images'
	imagec.imageUrl = config.uploadUrl + '/images';
	fs2.makeDirs(imagec.imageDir, next);
});

init.add(function (next) {
	mongo.images = mongo.db.collection("images");
	mongo.images.ensureIndex({ uid: 1, _id: -1 }, next);
});

init.add(function (next) {
	var opt = {
		fields: { _id: 1 },
		sort: { _id: -1 },
		limit: 1
	};
	mongo.images.find({}, opt).nextObject(function (err, obj) {
		if (err) return next(err);
		seed = obj ? obj._id : 0;
		console.log('image-create: id seed = ' + seed);
		next();
	});
});

init.add(function () {
	var app = express.app;

	app.post('/api/images', function (req, res) {
		usera.getUser(res, function (err, user) {
			if (err) return res.jsonErr(err);
			var form = imagec.getForm(req.body);
			imagec.createImages(form, user, function (err, ids) {
				if (err) return res.jsonErr(err);
				res.json({
					ids: ids
				});
			});
		});
	});

	app.get('/images/new', function (req, res) {
		usera.getUser(res, function (err, user) {
			if (err) return res.renderErr(err);
			var now = new Date();
			imagec.getTicketCount(now, user, function (err, count, hours) {
				res.render('image-create', {
					count: count,
					hours: hours
				});
			});
		});
	});
});

imagec.newImageId = function () {
	return ++seed;
};

imagec.getImageDir = function (id) {
	return fs2.makeDeepPath(imagec.imageDir, id, 3);
};

imagec.getOriginalPath = function (dir, id, format) {
	return dir + '/' + id + '-org.' + format;
}

imagec.getVersionPath = function (dir, id, width) {
	return dir + '/' + id + '-' + width + '.jpg';
};

imagec.getForm = function (body) {
	var form = {};
	form.now = new Date();
	form.comment = body.comment || '';
	form.files = upload.normalizeFiles(body.files);
	return form;
}

imagec.getTicketCount = function(now, user, next) {
	var count = config.ticketMax;
	var hours;
	var opt = {
		fields: { cdate: 1 },
		sort: { uid: 1, _id: -1 },
		limit: config.ticketMax
	}
	mongo.images.find({ uid: user._id }, opt).toArray(function (err, images) {
		if (err) return next(err);
		for (var i = 0; i < images.length; i++) {
			hours = config.ticketGenInterval - Math.floor((now.getTime() - images[i].cdate.getTime()) / (60 * 60 * 1000));
			if (hours > 0) {
				count--;
			} else {
				break;
			}
		}
		next(null, count, hours);
	});
};

imagec.createImages = function(form, user, _next) {
	var next = upload.deleter(form.files, _next);
	if (!form.files.length) {
		return next(error(error.ids.IMAGE_NO_FILE));
	}
	var i = 0;
	var ids = [];
	function create() {
		if (i == form.files.length) {
			return next(null, ids);
		}
		var file = form.files[i++];
		imagec.getTicketCount(form.now, user, function (err, count, hours) {
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
	imagec.checkImageMeta(file, function (err, meta) {
		if (err) return next(err);
		var id = imagec.newImageId();
		fs2.makeDirs(dir, function (err) {
			if (err) return next(err);
			fs.rename(file.tpath, org, function (err) {
				if (err) return next(err);
				imagec.makeVersions(id, dir, org, meta.width, function (err, vers) {
					if (err) return next(err);
					var image = {
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
					mongo.images.insert(image, function (err) {
						if (err) return next(err);
						next(null, id);
					});
				});
			});
		});
	});
}

imagec.checkImageMeta = function (file, next) {
	imagec.identify([file.tpath], function (err, meta) {
		if (err) {
			return next(error(error.ids.IMAGE_TYPE))
		}
		if (meta.width < config.minWidth - 15 || meta.height < config.minHeight - 15 ) {
			return next(error(error.ids.IMAGE_SIZE));
		}
		next(null, meta);
	});
}

imagec.identify = function (fname, next) {
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

imagec.makeVersions = function (id, dir, org, width, next) {
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
		cmd += ' -resize ' + dim.width + 'x' + dim.height + '^' // '^' means these are minimum values.
		cmd += ' -crop ' + dim.width + 'x' + dim.height + '+0+0'
		cmd	+= ' +repage'
		if (i == _vers.length - 1) {
		} else {
		}
	}
	exec(cmd, function (err) {
		next(err, vers);
	});
};
