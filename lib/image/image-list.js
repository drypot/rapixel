var fs = require('fs');
var path = require('path');

var lang = require('../lang/lang');
var init = require('../lang/init');
var config = require('../config/config');
var fs2 = require('../fs/fs');
var dt = require('../lang/dt');
var mongo = require('../mongo/mongo');
var express = require('../express/express');
var UrlMaker = require('../http/UrlMaker');
var usera = require('../user/user-auth');
var upload = require('../upload/upload');
var error = require('../error/error');


	app.get('/api/images', function (req, res) {
		var params = imagel.makeListParams(req);
		params.query = {};
		imagel.findImages(params, function (err, images, gt, lt) {
			if (err) return res.jsonErr(err);
			res.json({
				images: images,
				gt: gt,
				lt: lt
			});
		});
	});


	app.get('/images', function (req, res) {
		res.redirect('/');
	});

	app.get('/', function (req, res) {
		var params = imagel.makeListParams(req, {});
		imagel.findImages(params, function (err, images, gt, lt) {
			if (err) return res.renderErr(err);
			res.render('image-list', {
				images: images,
				gtUrl: gt ? new UrlMaker('/').add('gt', gt, 0).toString() : undefined,
				ltUrl: lt ? new UrlMaker('/').add('lt', lt, 0).toString() : undefined
			});
		});
	});


exports.makeListParams = function (req, query) {
	var params = {};
	params.query = query;
	params.lt = parseInt(req.query.lt) || 0;
	params.gt = params.lt ? 0 : parseInt(req.query.gt) || 0;
	params.ps = parseInt(req.query.ps) || 16;
	return params;
}

exports.findImages = function (params, next) {
	mongo.findPaged(mongo.images, params.query, params.gt, params.lt, params.ps, function (image, next) {
		userb.getCached(image.uid, function (err, user) {
			if (err) return next(err);
			image.user = {
				_id: user._id,
				name: user.name,
				home: user.home
			};
			image.dir = fs2.makeDeepPath(imageUrl, image._id, 3);
			image.cdateStr = dt.format(image.cdate);
			next(null, image);
		});
	}, next);
}
