var MongoClient = require('mongodb').MongoClient;
var Server = require('mongodb').Server;
var ObjectID = require('mongodb').ObjectID;

var init = require('../main/init');
var config = require('../main/config');

var opt = {};

exports = module.exports = function (_opt) {
	for(var p in _opt) {
		opt[p] = _opt[p];
	}
	return exports;
};


init.add(function (next) {

	var server = new Server('localhost', 27017, { auto_reconnect: true } );
	var client = new MongoClient(server);

	exports.ObjectID = ObjectID;

	client.open(function (err) {
		if (err) return next(err);
		var db = exports.db = client.db(config.data.mongoDb);
		console.log('mongo: ' + db.databaseName);
		if (opt.dropDatabase) {
			console.log('mongo: drop-database');
			db.dropDatabase(next);
		} else {
			next();
		}
	});

});

init.add(function (next) {

	var users;
	var userIdSeed;

	exports.getNewUserId = function () {
		return ++userIdSeed;
	};

	exports.insertUser = function (user, next) {
		users.insert(user, next);
	};

	exports.findUser = function (id, next) {
		users.findOne({ _id: id }, next);
	};

	exports.findUserByName = function (name, next) {
		users.findOne({ name: name }, next);
	};

	exports.findUserByEmail = function (email, next) {
		users.findOne({ email: email }, next);
	};

	exports.updateUserAdate = function (id, now, next) {
		users.update({ _id: id }, { $set: { adate: now } }, next);
	};

	exports.updateUserStatus = function (id, status, next) {
		users.update({ _id: id }, { $set: { status: status } }, next);
	};

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

	users = exports.users = exports.db.collection("users");
	users.ensureIndex({ email: 1 }, function (err) {
		if (err) return next(err);
		users.ensureIndex({ name: 1 }, function (err) {
			if (err) return next(err);
			var opt = {
				fields: { _id: 1 },
				sort: { _id: -1 },
				limit: 1
			}
			users.find({}, opt).nextObject(function (err, obj) {
				if (err) return next(err);
				userIdSeed = obj ? obj._id : 0;
				console.log('mongo: user id seed = ' + userIdSeed);
				next();
			});
		});
	});

});

init.add(function (next) {

	var photos;
	var photoIdSeed;

	exports.newPhotoId = function () {
		return ++photoIdSeed;
	};

	exports.insertPhoto = function (photo, next) {
		photos.insert(photo, next);
	};

	exports.updatePhotoHit = function (id, next) {
		photos.update({ _id: id }, { $inc: { hit: 1 }}, next);
	};

	exports.updatePhotoFields = function (id, fields, next) {
		photos.update({ _id: id }, { $set: fields }, next);
	}

	exports.delPhoto = function (id, next) {
		photos.remove({ _id: id }, next);
	}

	exports.findPhoto = function (id, next) {
		photos.findOne({ _id: id }, next);
	};

	exports.findLastPhoto = function (uid, next) {
		var opt = {
			fields: { cdate: 1 },
			sort: { uid: 1, _id: -1 }
		}
		photos.findOne({ uid: uid }, opt, next);
	}

	photos = exports.photos = exports.db.collection("photos");
	photos.ensureIndex({ uid: 1, _id: -1 }, function (err) {
		if (err) return next(err);
		var opt = {
			fields: { _id: 1 },
			sort: { _id: -1 },
			limit: 1
		};
		photos.find({}, opt).nextObject(function (err, obj) {
			if (err) return next(err);
			photoIdSeed = obj ? obj._id : 0;
			console.log('mongo: photo id seed = ' + photoIdSeed);
			next();
		});
	});

});

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

init.add(function (next) {

	exports.findPaged = function (collection, query, gt, lt, ps, filter, next) {
		var opt;
		if (lt) {
			query._id = { $lt: lt };
			opt = {
				sort: { _id: -1 },
				limit: ps + 1
			};
		} else if (gt) {
			query._id = { $gt: gt };
			opt = {
				sort: { _id: 1 },
				limit: ps + 1
			};
		} else {
			opt = {
				sort: { _id: -1 },
				limit: ps + 1
			};
		}
		var cursor = collection.find(query, opt);
		var results = [];
		var count = 0, first = 0, last = 0;
		function read() {
			cursor.nextObject(function (err, result) {
				if (err) return next(err);
				if (result) {
					count++;
					if (count > ps) {
						setImmediate(read);
						return;
					}
					if (!first) first = result._id;
					last = result._id;
					if (filter) {
						filter(result, function (err, result) {
							if (err) return next(err);
							if (result) {
								if (gt) {
									results.unshift(result);
								} else {
									results.push(result);
								}
							}
							setImmediate(read);
						});
					} else {
						if (gt) {
							results.unshift(result);
						} else {
							results.push(result);
						}
						setImmediate(read);
					}
					return;
				}
				var more = count > ps;
				if (gt) {
					gt = more ? last : 0;
					lt = first;
				} else if (lt) {
					gt = first;
					lt = more ? last : 0;
				} else {
					gt = 0;
					lt = more ? last : 0;
				}
				next(null, results, gt, lt);
			});
		}
		read();
	};

	next();
});