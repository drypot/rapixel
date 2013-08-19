var init = require('../lang/init');
var config = require('../config/config');
var dt = require('../lang/dt');
var mongo = require('../mongo/mongo');
var express = require('../express/express');
var upload = require('../upload/upload');
var userv = require('../user/user-view');
var imageb = require('../image/image-base');
var error = require('../error/error');

init.add(function () {
	var app = express.app;

	app.get('/api/images/:id([0-9]+)', function (req, res) {
		var id = parseInt(req.params.id) || 0;
		incHit(id, req.query.hasOwnProperty('hit'), function (err) {
			if (err) return res.jsonErr(err);
			findImage(id, function (err, image) {
				if (err) return res.jsonErr(err);
				res.json(image);
			});
		});
	});

	app.get('/images/:id([0-9]+)', function (req, res) {
		var id = parseInt(req.params.id) || 0;
		incHit(id, true, function (err) {
			if (err) return res.jsonErr(err);
			findImage(id, function (err, image) {
				if (err) return res.renderErr(err);
				res.render('image-view', {
					image: image,
					imageView: true
				});
			});
		});
	});
});

function incHit(id, hit, next) {
	if (!hit) return next();
	mongo.images.update({ _id: id }, { $inc: { hit: 1 }}, next);
}

function findImage(id, next) {
	mongo.images.findOne({ _id: id }, function (err, image) {
		if (err) return next(err);
		if (!image) return next(error(error.ids.IMAGE_NOT_EXIST));
		userv.getCached(image.uid, function (err, user) {
			if (err) return next(err);
			image.user = {
				_id: user._id,
				name: user.name,
				home: user.home
			};
			image.dir = imageb.getImageUrl(image._id);
			image.cdateStr = dt.format(image.cdate);
			image.cdate = image.cdate.getTime();
			next(null, image);
		});
	});
};

