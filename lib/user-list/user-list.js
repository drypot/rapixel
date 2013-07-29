	var users = [];
	var usersByHome = {};

	exports.findUser = function (id, next) {
		users.findOne({ _id: id }, next);
	};

	exports.findUserByName = function (name, next) {
		users.findOne({ name: name }, next);
	};


	exports.findUserByHome = function (home, next) {
		users.findOne({ home: home }, next);
	};



	function deleteCache(id) {
		var user = users[id];
		if (user) {
			delete users[id];
			delete usersByHome[user.home];
		}
	}

	function addCache(user) {
		users[user._id] = user;
		usersByHome[user.home] = user;
	}


	exports.findCachedUser = function (id, next) {
		var user = users[id];
		if (user) {
			return next(null, user);
		}
		mongo.findUser(id, function (err, user) {
			if (err) return next(err);
			if (!user) return next(error(ecode.USER_NOT_FOUND));
			addCache(user);
			next(null, user);
		});
	};

	exports.findCachedUserByHome = function (home, next) {
		var user = usersByHome[home];
		if (user) {
			return next(null, user);
		}
		mongo.findUserByHome(home, function (err, user) {
			if (err) return next(err);
			if (!user) {
				// 사용자 프로필 URL 검색에 주로 사용되므로 error 생성은 패스한다.
				return next();
			}
			addCache(user);
			next(null, user);
		});
	};

	exports.findUserByEmailAndCache = function (email, next) {
		mongo.findUserByEmail(email, function (err, user) {
			if (err) return next(err);
			if (!user) {
				return next();
			}
			addCache(user);
			next(null, user);
		});
	};





	exports.findUserForView = function (user, id, next) {
		exports.findCachedUser(id, function (err, _tuser) {
			if (err) return next(err);
			var tuesr;
			if (user && user.admin) {
				tuesr = {
					_id: _tuser._id,
					name: _tuser.name,
					home: _tuser.home,
					email: _tuser.email,
					status: _tuser.status,
					cdate: _tuser.cdate.getTime(),
					adate: _tuser.adate.getTime(),
					profile: _tuser.profile
				};
			} else if (user && user._id == _tuser._id) {
				tuesr = {
					_id: _tuser._id,
					name: _tuser.name,
					home: _tuser.home,
					email: _tuser.email,
					status: _tuser.status,
					cdate: _tuser.cdate.getTime(),
					adate: _tuser.adate.getTime(),
					profile: _tuser.profile
				};
			} else {
				tuesr = {
					_id: _tuser._id,
					name: _tuser.name,
					home: _tuser.home,
					//email: _tuser.email,
					status: _tuser.status,
					cdate: _tuser.cdate.getTime(),
					//adate: _tuser.adate.getTime(),
					profile: _tuser.profile
				};
			}
			next(null, tuesr);
		});
	}
