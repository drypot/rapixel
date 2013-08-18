var fs = require('fs');

var init = require('../lang/init');
var config = require('../config/config');
var fs2 = require('../fs/fs');
var mongo = require('../mongo/mongo');
var express = require('../express/express');
var upload = require('../upload/upload');
var usera = require('../user/user-auth');
var imageb = require('../image/image-base');
var site = require('../image/image-site');
var error = require('../error/error');

var seed;

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
			var form = exports.getForm(req.body);
			exports.createImages(form, user, function (err, ids) {
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
			exports.getTicketCount(now, user, function (err, count, hours) {
				res.render('image-create', {
					count: count,
					hours: hours
				});
			});
		});
	});
});

exports.newImageId = function () {
	return ++seed;
};

exports.getForm = function (body) {
	var form = {};
	form.now = new Date();
	form.comment = body.comment || '';
	form.files = upload.normalizeFiles(body.files);
	return form;
}

exports.getTicketCount = function(now, user, next) {
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

exports.createImages = function(form, user, _next) {
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
		exports.getTicketCount(form.now, user, function (err, count, hours) {
			if (err) return next(err);
			if (!count) {
				return next(null, ids);
			}
			createImage(form, file, user, function (err, id) {
				if (err) return next(err);
				ids.push(id);
				setImmediate(create);
			});
		});
	}
	create();
};

function createImage(form, file, user, next) {
	site.checkImageMeta(file.tpath, function (err, meta) {
		if (err) return next(err);
		var id = exports.newImageId();
		var dir = imageb.getImageDir(id);
		fs2.makeDirs(dir, function (err) {
			if (err) return next(err);
			var org = imageb.getOriginalPath(dir, id, meta.format);
			fs.rename(file.tpath, org, function (err) {
				if (err) return next(err);
				site.makeVersions(org, meta, dir, id, function (err, vers) {
					if (err) return next(err);
					var image = {
						_id: id,
						uid: user._id,
						hit: 0,
						fname: file.oname,
						format: meta.format,
						cdate: form.now
					};
					site.fillFields(image, form, meta, vers);
					mongo.images.insert(image, function (err) {
						if (err) return next(err);
						next(null, id);
					});
				});
			});
		});
	});
}

