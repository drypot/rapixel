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


