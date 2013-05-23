var MongoClient = require('mongodb').MongoClient;
var Server = require('mongodb').Server;

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

	var log = 'mongo:';

	openDb(function (err, db) {
		if (err) return next(err);
		dropDatabase(db, function (err) {
			if (err) return next(err);
			initUsers(db, function (err) {
				if (err) return next(err);
				initPhotos(db, function (err) {
					if (err) return next(err);
					console.log(log);
					next();
				});
			});
		});
	});

	function openDb(next) {
		var server = new Server('localhost', 27017, { auto_reconnect: true } );
		var client = new MongoClient(server);
		client.open(function (err) {
			if (err) return next(err);
			var db = exports.db = client.db(config.data.mongoDbName);
			log += ' ' + db.databaseName;
			next(null, db);
		});
	}

	function dropDatabase(db, next) {
		if (opt.dropDatabase) {
			log += ' drop-database';
			db.dropDatabase(next);
		} else {
			next();
		}
	}

	function initUsers(db, next) {
		var users;
		var userIdSeed;

		exports.newUserId = function () {
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
			users.update({ _id: id }, { $set: { adate: now }}, function (err) {
				next(err);
			});
		};

		exports.updateUserPdate = function (id, now, next) {
			users.update({ _id: id }, { $set: { pdate: now }}, function (err) {
				next(err);
			});
		};

		users = exports.users = db.collection("users");
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
					console.log('user id seed: ' + userIdSeed);
					next();
				});
			});
		});
	}

	function initPhotos(db, next) {
		var photos;
		var photoIdSeed;

		exports.newPhotoId = function () {
			return ++photoIdSeed;
		};

		exports.insertPhoto = function (photo, next) {
			photos.insert(photo, next);
		};

		exports.updatePhotoHit = function (pid, next) {
			photos.update({ _id: pid }, { $inc: { hit: 1 }}, next);
		};

		exports.delPhoto = function (pid, uid, next) {
			var sel = {
				_id: pid
			};
			if (uid) {
				sel.uid = uid
			}
			photos.remove(sel, next);
		}

		exports.findPhoto = function (pid, next) {
			photos.findOne({ _id: pid }, next);
		};

		exports.findLastPhoto = function (uid, next) {
			var opt = {
				fields: { cdate: 1 },
				sort: { uid: 1, _id: -1 }
			}
			photos.findOne({ uid: uid }, opt, next);
		}

		exports.findPhotos = function (pg, pgsize) {
			var opt = {
				sort: { _id: -1 },
				skip: (Math.abs(pg) - 1) * pgsize,
				limit: pgsize
			};
			return photos.find({}, opt);
		};

//		exports.findPhotosByUser = function (uid, pg, pgsize, next) {
//
//		};

		photos = exports.photos = db.collection("photos");
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
				console.log('photo id seed: ' + photoIdSeed);
				next();
			});
		});
	}

});

