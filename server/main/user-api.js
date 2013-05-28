var init = require('../main/init');
var dt = require('../main/dt');
var userl = require('../main/user');
var express = require('../main/express');

init.add(function () {

	var app = express.app;

	console.log('users-api:');

	app.get('/api/users/:id([0-9]+)', function (req, res) {
		var id = parseInt(req.params.id) || 0;
		var user = res.locals.user;
		userl.findCachedUser(id, function (err, cuser) {
			if (err) return res.jsonErr(err);
			if (user && (user._id == cuser._id || user.admin)) {
				res.json({
					user: {
						_id: cuser._id,
						name: cuser.name,
						status: cuser.status,
						cdate: cuser.cdate.getTime(),
						adate: cuser.adate.getTime(),
						profile: cuser.profile,
						email: cuser.email
					}
				});
			} else {
				res.json({
					user: {
						_id: cuser._id,
						name: cuser.name,
						status: cuser.status,
						cdate: cuser.cdate.getTime(),
						adate: cuser.adate.getTime(),
						profile: cuser.profile
					}
				});
			}
		});
	});

	app.post('/api/users', function (req, res) {
		var form = userl.makeForm(req);
		userl.createUser(form, function (err, user) {
			if (err) return res.jsonErr(err);
			res.json({
				user: {
					_id: user._id
				}
			});
		});
	});

	app.put('/api/users/:id([0-9]+)', function (req, res) {
		req.findUser(function (err, user) {
			if (err) return res.jsonErr(err);
			var id = parseInt(req.params.id) || 0;
			var form = userl.makeForm(req);
			userl.updateUser(id, user, form, function (err) {
				if (err) return res.jsonErr(err);
				res.json({});
			})
		});
	});

	app.del('/api/users/:id([0-9]+)', function (req, res) {
		req.findUser(function (err, user) {
			if (err) return res.jsonErr(err);
			var id = parseInt(req.params.id) || 0;
			userl.delUser(id, function (err) {
				if (err) return res.jsonErr(err);
				res.json({});
			});
		});
	});

});
