var init = require('../lang/init');
var mongo = require('../mongo/mongo');
var express = require('../express/express');
var UrlMaker = require('../http/UrlMaker');
var userb = require('../user/user-base');
// var imagel = require('../image-list/image-list');
var error = require('../error/error');
var ecode = require('../error/ecode');

init.add(function () {
	var app = express.app;

	app.get('/api/users/:id([0-9]+)', function (req, res) {
		var id = parseInt(req.params.id) || 0;
		var user = res.locals.user
		userb.getCached(id, function (err, _tuser) {
			if (err) return res.jsonErr(err);
			var tuser;
			if (user && user.admin) {
				tuser = {
					_id: _tuser._id,
					name: _tuser.name,
					home: _tuser.home,
					email: _tuser.email,
					status: _tuser.status,
					cdate: _tuser.cdate.getTime(),
					adate: _tuser.adate.getTime(),
					profile: _tuser.profile
				};
			} else if (user && user._id == _tuser._id) {
				tuser = {
					_id: _tuser._id,
					name: _tuser.name,
					home: _tuser.home,
					email: _tuser.email,
					status: _tuser.status,
					cdate: _tuser.cdate.getTime(),
					adate: _tuser.adate.getTime(),
					profile: _tuser.profile
				};
			} else {
				tuser = {
					_id: _tuser._id,
					name: _tuser.name,
					home: _tuser.home,
					//email: _tuser.email,
					status: _tuser.status,
					cdate: _tuser.cdate.getTime(),
					//adate: _tuser.adate.getTime(),
					profile: _tuser.profile
				};
			}
			res.json({
				user: tuser
			});
		});
	});

	app.get('/users/:id([0-9]+)', function (req, res) {
		var id = parseInt(req.params.id) || 0;
		exports.renderProfile(req, res, id);
	});

	app.get('/:name([^/]+)', function (req, res, next) {
		var homel = decodeURIComponent(req.params.name).toLowerCase();
		userb.getCachedByHome(homel, function (err, user) {
			if (user) {
				return renderProfile(req, res, user._id);
			}
			next();
		});
	});
});

function renderProfile(req, res, id) {
	var user = res.locals.user;
	userb.getCached(id, function (err, tuser) {
		if (err) return res.renderErr(err);
		var params = imagel.makeListParams(req, { uid: id });
		imagel.findPhotos(params, function (err, images, gt, lt) {
			if (err) return res.renderErr(err);
			res.render('user-view', {
				tuser: tuser,
				showBtns: user && (user.admin || user._id === id),
				images: images,
				gtUrl: gt ? new UrlMaker(req.path).add('gt', gt, 0).toString() : undefined,
				ltUrl: lt ? new UrlMaker(req.path).add('lt', lt, 0).toString() : undefined
			});
		});
	});
};
