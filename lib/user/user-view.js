var init = require('../lang/init');
var mongo = require('../mongo/mongo');
var express = require('../express/express');
var UrlMaker = require('../http/UrlMaker');
var userb = require('../user/user-base');
// var photol = require('../photo-list/photo-list');
var error = require('../error/error');
var ecode = require('../error/ecode');

init.add(function () {
	var app = express.app;

	app.get('/api/users/:id([0-9]+)', function (req, res) {
		var id = parseInt(req.params.id) || 0;
		var user = res.locals.user
		userb.getCached(id, function (err, _tuser) {
			if (err) return express.jsonErr(res, err);
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
		if (err) return express.renderErr(res, err);
		var params = photol.makeListParams(req, { uid: id });
		photol.findPhotos(params, function (err, photos, gt, lt) {
			if (err) return express.renderErr(res, err);
			res.render('user-view', {
				tuser: tuser,
				showBtns: user && (user.admin || user._id === id),
				photos: photos,
				gtUrl: gt ? new UrlMaker(req.path).add('gt', gt, 0).toString() : undefined,
				ltUrl: lt ? new UrlMaker(req.path).add('lt', lt, 0).toString() : undefined
			});
		});
	});
};
