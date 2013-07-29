	exports.updateUserStatus = function (id, status, next) {
		users.update({ _id: id }, { $set: { status: status } }, next);
	};



	exports.deactivateUser = function (id, user, next) {
		checkUpdatable(id, user, function (err) {
			if (err) return next(err);
			mongo.updateUserStatus(id, 'd', function (err, cnt) {
				if (err) return next(err);
				if (!cnt) {
					return next(error(ecode.USER_NOT_FOUND));
				}
				deleteCache(id);
				next();
			});
		});
	};


	app.del('/api/users/:id([0-9]+)', function (req, res) {
		req.checkUser(function (err, user) {
			if (err) return res.jsonErr(err);
			var id = parseInt(req.params.id) || 0;
			userl.deactivateUser(id, user, function (err) {
				if (err) return res.jsonErr(err);
				session.delSession(req, res);
				res.json({});
			});
		});
	});


	app.get('/users/deactivate', function (req, res) {
		req.checkUser(function (err, user) {
			if (err) return res.renderErr(err);
			res.render('user-deactivate');
		});
	});

