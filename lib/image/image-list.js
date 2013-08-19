var init = require('../lang/init');
var config = require('../config/config');
var dt = require('../lang/dt');
var error = require('../error/error');
var mongo = require('../mongo/mongo');
var express = require('../express/express');
var http2 = require('../http/http');
var userv = require('../user/user-view');
var imageb = require('../image/image-base');

init.add(function () {
	var app = express.app;
	
	app.get('/api/images', function (req, res) {
		var params = exports.getParams(req);
		exports.findImages(params, function (err, images, gt, lt) {
			if (err) return res.jsonErr(err);
			res.json({
				images: images,
				gt: gt,
				lt: lt
			});
		});
	});

	app.get('/', function (req, res) {
		var params = exports.getParams(req);
		exports.findImages(params, function (err, images, gt, lt) {
			if (err) return res.renderErr(err);
			res.render('image-list', {
				images: images,
				gtUrl: gt ? http2.makeUrl(('/'), { gt: gt }) : undefined,
				ltUrl: lt ? http2.makeUrl(('/'), { lt: lt }) : undefined
			});
		});
	});
});

exports.getParams = function (req) {
	var params = {};
	params.lt = parseInt(req.query.lt) || 0;
	params.gt = params.lt ? 0 : parseInt(req.query.gt) || 0;
	params.ps = parseInt(req.query.ps) || 16;
	return params;
};

exports.findImages = function (params, next) {
	var query = params.uid ? { uid: params.uid } : {};
	mongo.findPage(mongo.images, query, params.gt, params.lt, params.ps, modify, next);
};

function modify(image, next) {
	userv.getCached(image.uid, function (err, user) {
		if (err) return next(err);
		image.user = {
			_id: user._id,
			name: user.name,
			home: user.home
		};
		image.dir = imageb.getImageUrl(image._id);
		image.cdateStr = dt.format(image.cdate);
		next(null, image);
	});
}
