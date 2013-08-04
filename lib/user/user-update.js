var init = require('../lang/init');
var mongo = require('../mongo/mongo');
var express = require('../express/express');
var userb = require('../user/user-base');
var usera = require('../user/user-auth');
var userc = require('../user/user-create');
var error = require('../error/error');

init.add(function () {
	var app = express.app;

	app.put('/api/users/:id([0-9]+)', function (req, res) {
		usera.getUser(res, function (err, user) {
			if (err) return res.jsonErr(err);
			var id = parseInt(req.params.id) || 0;
			var form = userc.getForm(req.body);
			updateUser(id, user, form, function (err) {
				if (err) return res.jsonErr(err);
				res.json({});
			})
		});
	});

	app.get('/users/:id([0-9]+)/update', function (req, res) {
		usera.getUser(res, function (err, user) {
			if (err) return res.renderErr(err);
			var id = parseInt(req.params.id) || 0;
			exports.checkUpdatable(id, user, function (err) {
				if (err) return res.renderErr(err);
				userb.getCached(id, function (err, tuser) {
					if (err) return res.renderErr(err);
					res.render('user-update', {
						tuser: tuser
					});
				});
			});
		});
	});
});

function updateUser(id, user, form, next) {
	exports.checkUpdatable(id, user, function (err) {
		if (err) return next(err);
		form.namel = form.name.toLowerCase();
		form.homel = form.home.toLowerCase();
		userc.checkForm(form, id, function (err) {
			if (err) return next(err);
			var fields = {
				name: form.name,
				namel: form.namel,
				home: form.home,
				home: form.homel,
				email: form.email,
				profile: form.profile
			};
			if (form.password.length) {
				fields.hash = userb.makeHash(form.password);
			}
			mongo.users.update({ _id: id }, { $set: fields }, function (err, cnt) {
				if (err) return next(err);
				if (!cnt) {
					return next(error(error.ids.USER_NOT_FOUND));
				}
				userb.deleteCache(id);
				next();
			});
		});
	});
};

exports.checkUpdatable = function (id, user, next) {
	if (user._id != id && !user.admin) {
		return next(error(error.ids.NOT_AUTHORIZED))
	}
	next();
}
