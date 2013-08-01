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

	var app = express.app;

	app.get('/api/photos/:id([0-9]+)', function (req, res) {
		var id = parseInt(req.params.id) || 0;
		photol.incHit(id, function (err) {
			if (err) return res.jsonErr(err);
			photol.findPhoto(id, function (err, photo) {
				if (err) return res.jsonErr(err);
				res.json(photo);
			});
		});
	});


	app.get('/photos/:id([0-9]+)', function (req, res) {
		var id = parseInt(req.params.id) || 0;
		photol.incHit(id, function (err) {
			if (err) return res.jsonErr(err);
			photol.findPhoto(id, function (err, photo) {
				if (err) return res.renderErr(err);
				res.render('photo-view', {
					photo: photo,
					photoView: true
				});
			});
		});
	});


	exports.updatePhotoHit = function (id, next) {
		photos.update({ _id: id }, { $inc: { hit: 1 }}, next);
	};

	exports.findPhoto = function (id, next) {
		photos.findOne({ _id: id }, next);
	};

exports.incHit = function (id, next) {
	mongo.updatePhotoHit(id, next);
}

exports.findPhoto = function (id, next) {
	mongo.findPhoto(id, function (err, photo) {
		if (err) return next(err);
		if (!photo) return next(error(ecode.PHOTO_NOT_EXIST));
		userb.getCached(photo.uid, function (err, user) {
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

