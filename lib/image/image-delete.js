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


	app.del('/api/images/:id([0-9]+)', function (req, res) {
		usera.getUser(res, function (err, user) {
			if (err) return res.jsonErr(err);
			var id = parseInt(req.params.id) || 0;
			imagel.checkUpdatable(id, user, function (err) {
				if (err) return res.jsonErr(err);
				imagel.delPhoto(id, function (err) {
					if (err) return res.jsonErr(err);
					res.json({});
				});
			});
		});
	});

	exports.delPhoto = function (id, next) {
		images.remove({ _id: id }, next);
	}


exports.delPhoto = function (id, next) {
	mongo.delPhoto(id, function (err, cnt) {
		if (err) return next(err);
		fs2.removeDirs(exports.getPhotoDir(id), function (err) {
			if (err) return next(err);
			next();
		});
	});
};