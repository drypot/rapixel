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

	app.put('/api/images/:id([0-9]+)', function (req, res) {
		usera.getUser(res, function (err, user) {
			if (err) return res.jsonErr(err);
			var id = parseInt(req.params.id) || 0;
			var form = imagel.getForm(req.body);
			imagel.checkUpdatable(id, user, function (err) {
				if (err) return res.jsonErr(err);
				imagel.updatePhoto(id, form, function (err) {
					if (err) return res.jsonErr(err);
					res.json({});
				});
			});
		});
	});


	app.get('/images/:id([0-9]+)/update', function (req, res) {
		usera.getUser(res, function (err, user) {
			if (err) return res.renderErr(err);
			var id = parseInt(req.params.id) || 0;
			imagel.checkUpdatable(id, user, function (err, image) {
				if (err) return res.renderErr(err);
				res.render('image-update', {
					image: image
				});
			});
		});
	});


	exports.updatePhotoFields = function (id, fields, next) {
		images.update({ _id: id }, { $set: fields }, next);
	}


exports.checkUpdatable = function (id, user, next) {
	mongo.findPhoto(id, function (err, image) {
		if (err) return next(err);
		if (!image) {
			return next(error(ecode.PHOTO_NOT_EXIST));
		}
		if (!user.admin && image.uid != user._id) {
			return next(error(ecode.NOT_AUTHORIZED));
		}
		next(null, image);
	});
}

exports.updatePhoto = function(id, form, _next) {
	var next = upload.deleter(form.files, _next);
	if (form.file) {
		checkPhotoMeta(form, function (err, meta) {
			if (err) return next(err);
			var dir = exports.getPhotoDir(id);
			fs2.removeDirs(dir, function (err) {
				if (err) return next(err);
				fs2.makeDirs(dir, function (err) {
					if (err) return next(err);
					var org = exports.getOriginalPath(dir, id, meta.format);
					fs.rename(form.file.tpath, org, function (err) {
						if (err) return next(err);
						exports.makeVersions(id, dir, org, meta.width, function (err, vers) {
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
