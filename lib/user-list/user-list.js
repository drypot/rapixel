	exports.countUsers = function (next) {
		mongo.users.count(next);
	};




	app.get('/users', function (req, res) {
		userl.countUsers(function (err, count) {
			if (err) return express.renderErr(res, err);
			res.render('user-list', { count: count });
		});
	});
