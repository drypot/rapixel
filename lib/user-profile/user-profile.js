var init = require('../lang/init');
var error = require('../error/error');
var express = require('../express/express');
var http2 = require('../http/http');
var userv = require('../user/user-view');
var imagel = require('../image/image-list');

init.add(function () {
	var app = express.app;

	app.get('/users/:id([0-9]+)', function (req, res) {
		var id = parseInt(req.params.id) || 0;
		renderProfile(req, res, id);
	});

	app.get('/:name([^/]+)', function (req, res, next) {
		var homel = decodeURIComponent(req.params.name).toLowerCase();
		userv.getCachedByHome(homel, function (err, user) {
			if (!user) return next();
			renderProfile(req, res, user._id);
		});
	});
});

function renderProfile(req, res, id) {
	var user = res.locals.user;
	userv.getCached(id, function (err, tuser) {
		if (err) return res.renderErr(err);
		var params = imagel.getParams(req);
		params.uid = id;
		imagel.findImages(params, function (err, images, gt, lt) {
			if (err) return res.renderErr(err);
			res.render('user-profile/user-profile', {
				tuser: tuser,
				editable: user && (user.admin || user._id === id),
				images: images,
				gtUrl: gt ? http2.makeUrl(req.path, { gt: gt }) : undefined,
				ltUrl: lt ? http2.makeUrl(req.path, { lt: lt }) : undefined
			});
		});
	});
};
