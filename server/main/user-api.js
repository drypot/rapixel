var init = require('../main/init');
var dt = require('../main/dt');
var userl = require('../main/user');
var express = require('../main/express');

init.add(function () {

	var app = express.app;

	console.log('users-api:');

	app.get('/api/users/:id([0-9]+)', function (req, res) {
		var id = parseInt(req.params.id) || 0;
		userl.findUserForView(id, res.locals.user, function (err, tuser) {
			if (err) return res.jsonErr(err);
			res.json({
				user: tuser
			});
		})
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

	app.post('/api/resets', function (req, res) {
		var form = userl.makeResetReqForm(req);
		userl.createResetReq(form, function (err) {
			if (err) return res.jsonErr(err);
			res.json({});
		});
	});

	app.put('/api/resets', function (req, res) {
		var form = userl.makePassResetForm(req);
		userl.xxsendPassResetMail(form, function (err) {
			if (err) return res.jsonErr(err);
			res.json({});
		});
	});

});
