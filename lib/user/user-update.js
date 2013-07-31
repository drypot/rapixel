	exports.updateUser = function (id, fields, next) {
		users.update({ _id: id }, { $set: fields}, next);
	};

	exports.updateUserHash = function (email, hash, excludeAdmin, next) {
		var query = { email: email };
		if (excludeAdmin) {
			query.admin = { $exists: false };
		}
		users.update(query, { $set: { hash: hash } }, next)
	}


	function checkUpdatable(id, user, next) {
		if (user._id != id && !user.admin) {
			return next(error(ecode.NOT_AUTHORIZED))
		}
		next();
	}

		exports.updateUser = function (id, user, form, next) {
		checkUpdatable(id, user, function (err) {
			if (err) return next(err);
			checkForm(form, id, function (err) {
				if (err) return next(err);
				var fields = {
					name: form.name,
					home: form.home,
					email: form.email,
					profile: form.profile
				};
				if (form.password.length > 0) {
					fields.hash = makeHash(form.password);
				}
				mongo.updateUser(id, fields, function (err, cnt) {
					if (err) return next(err);
					if (!cnt) {
						return next(error(ecode.USER_NOT_FOUND));
					}
					deleteCache(id);
					next();
				});
			});
		});
	};

	exports.findUserForUpdate = function (id, user, next) {
		checkUpdatable(id, user, function (err) {
			if (err) return next(err);
			exports.getCached(id, function (err, _tuser) {
				if (err) return next(err);
				next(null, {
					_id: _tuser._id,
					name: _tuser.name,
					home: _tuser.home,
					email: _tuser.email,
					profile: _tuser.profile
				});
			});
		});
	};

	app.put('/api/users/:id([0-9]+)', function (req, res) {
		usera.getUser(res, function (err, user) {
			if (err) return express.jsonErr(res, err);
			var id = parseInt(req.params.id) || 0;
			var form = userl.makeForm(req.body);
			userl.updateUser(id, user, form, function (err) {
				if (err) return express.jsonErr(res, err);
				res.json({});
			})
		});
	});


	app.get('/users/:id([0-9]+)/update', function (req, res) {
		usera.getUser(res, function (err, user) {
			if (err) return express.renderErr(res, err);
			var id = parseInt(req.params.id) || 0;
			userl.findUserForUpdate(id, user, function (err, tuser) {
				if (err) return express.renderErr(res, err);
				res.render('user-profile-update', {
					tuser: tuser
				});
			});
		});
	});

