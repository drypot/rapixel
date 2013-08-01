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
var ecode = require('../error/ecode');

	app.get('/api/photos', function (req, res) {
		var params = photol.makeListParams(req);
		params.query = {};
		photol.findPhotos(params, function (err, photos, gt, lt) {
			if (err) return res.jsonErr(err);
			res.json({
				photos: photos,
				gt: gt,
				lt: lt
			});
		});
	});


	app.get('/photos', function (req, res) {
		res.redirect('/');
	});

	app.get('/', function (req, res) {
		var params = photol.makeListParams(req, {});
		photol.findPhotos(params, function (err, photos, gt, lt) {
			if (err) return res.renderErr(err);
			res.render('photo-list', {
				photos: photos,
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

exports.findPhotos = function (params, next) {
	mongo.findPaged(mongo.photos, params.query, params.gt, params.lt, params.ps, function (photo, next) {
		userb.getCached(photo.uid, function (err, user) {
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
