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

	app.get('/api/images/:id([0-9]+)', function (req, res) {
		var id = parseInt(req.params.id) || 0;
		imagel.incHit(id, function (err) {
			if (err) return res.jsonErr(err);
			imagel.findPhoto(id, function (err, image) {
				if (err) return res.jsonErr(err);
				res.json(image);
			});
		});
	});


	app.get('/images/:id([0-9]+)', function (req, res) {
		var id = parseInt(req.params.id) || 0;
		imagel.incHit(id, function (err) {
			if (err) return res.jsonErr(err);
			imagel.findPhoto(id, function (err, image) {
				if (err) return res.renderErr(err);
				res.render('image-view', {
					image: image,
					imageView: true
				});
			});
		});
	});


	exports.updatePhotoHit = function (id, next) {
		images.update({ _id: id }, { $inc: { hit: 1 }}, next);
	};

	exports.findPhoto = function (id, next) {
		images.findOne({ _id: id }, next);
	};

exports.incHit = function (id, next) {
	mongo.updatePhotoHit(id, next);
}

exports.findPhoto = function (id, next) {
	mongo.findPhoto(id, function (err, image) {
		if (err) return next(err);
		if (!image) return next(error(ecode.PHOTO_NOT_EXIST));
		userb.getCached(image.uid, function (err, user) {
			if (err) return next(err);
			image.user = {
				_id: user._id,
				name: user.name,
				home: user.home
			};
			image.dir = fs2.makeDeepPath(imageUrl, image._id, 3);
			image.cdateStr = dt.format(image.cdate);
			image.cdate = image.cdate.getTime();
			next(null, image);
		});
	});
};

