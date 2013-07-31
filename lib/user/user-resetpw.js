var mailer = require('../mail/mailer');


// TODO: mongo

init.add(function (next) {

	var resets;

	exports.insertReset = function (reset, next) {
		resets.insert(reset, next);
	};

	exports.delReset = function (email, next) {
		resets.remove({ email: email }, next);
	}

	exports.findReset = function (id, next) {
		resets.findOne({ _id: id }, next);
	};

	resets = exports.resets = exports.db.collection("resets");
	resets.ensureIndex({ email: 1 }, function (err) {
		if (err) return next(err);
		next();
	});

});


	exports.makeResetReqForm = function (req) {
		var form = {};
		form.email = String(req.body.email || '').trim();
		return form;
	}

	exports.createResetReq = function (form, next) {
		var errors = [];
		checkFormEmail(form, errors);
		if (errors.length) {
			return next(error(errors));
		}
		crypto.randomBytes(12, function(err, buf) {
			if (err) return next(err);
			var token = buf.toString('hex');
			mongo.findUserByEmail(form.email, function (err, user) {
				if (err) return next(err);
				if (!user) {
					return next(error(ecode.EMAIL_NOT_EXIST));
				}
				mongo.delReset(form.email, function (err) {
					if (err) return next(err);
					var reset = {
						email: form.email,
						token: token
					};
					mongo.insertReset(reset, function (err, resets) {
						if (err) return next(err);
						var reset = resets[0];
						var mail = {
							from: 'no-reply@raysoda.com',
							to: reset.email,
							subject: 'Reset Password - ' + config.data.appName,
							text:
								'\n' +
								'Open the following URL to reset password.\n\n' +
								config.data.frontUrl + '/users/reset?id=' + reset._id + '&t=' + reset.token + '\n\n' +
								config.data.appName
						};
						mailer.send(mail, next);
					});
				});
			});
		});
	};

	exports.makeResetForm = function (req) {
		var form = {};
		form._id = String(req.body._id || '').trim();
		form.token = String(req.body.token || '').trim();
		form.password = String(req.body.password || '').trim();
		return form;
	}

	exports.reset = function (form, next) {
		var errors = [];
		checkFormPassword(form, errors);
		if (errors.length) {
			return next(error(errors));
		}
		mongo.findReset(new mongo.ObjectID(form._id), function (err, reset) {
			if (err) return next(err);
			if (!reset) {
				return next(error(ecode.INVALID_DATA));
			}
			if (form.token != reset.token) {
				return next(error(ecode.INVALID_DATA));
			}
			if (Date.now() - reset._id.getTimestamp().getTime() > 15 * 60 * 1000) {
				return next(error(ecode.RESET_TIMEOUT));
			}
			mongo.updateUserHash(reset.email, makeHash(form.password), true, function (err) {
				if (err) return next(err);
				mongo.delReset(form.email, next);
				// user cache 를 찾아 지울 필요는 없다.
				// 세션 생성시 cache 에는 새로운 user 오브젝트가 대입;
			});
		});
	};

	app.post('/api/resets', function (req, res) {
		var form = userl.makeResetReqForm(req);
		userl.createResetReq(form, function (err) {
			if (err) return express.jsonErr(res, err);
			res.json({});
		});
	});

	app.put('/api/resets', function (req, res) {
		var form = userl.makeResetForm(req);
		userl.reset(form, function (err) {
			if (err) return express.jsonErr(res, err);
			res.json({});
		});
	});


		app.get('/users/reset-req', function (req, res) {
		res.render('user-reset-req');
	});

	app.get('/users/reset', function (req, res) {
		res.render('user-reset');
	});

