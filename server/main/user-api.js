var init = require('../main/init');
var dt = require('../main/dt');
var express = require('../main/express');
var userl = require('../main/user');
var session = require('../main/session');

init.add(function () {

	var app = express.app;

	console.log('users-api:');

	app.get('/api/users/:id([0-9]+)', function (req, res) {
		var id = parseInt(req.params.id) || 0;
		userl.findUserForView(res.locals.user, id, function (err, tuser) {
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
			userl.deactivateUser(id, user, function (err) {
				if (err) return res.jsonErr(err);
				session.delSession(req, res);
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
		var form = userl.makeResetForm(req);
		userl.reset(form, function (err) {
			if (err) return res.jsonErr(err);
			res.json({});
		});
	});

});
