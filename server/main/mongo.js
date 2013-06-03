var crypto = require('crypto');
var MongoClient = require('mongodb').MongoClient;
var Server = require('mongodb').Server;
var ObjectId = require('mongodb').ObjectId;

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
		users.update({ _id: id }, { $set: { adate: now }}, next);
	};

	exports.updateUserPdate = function (id, now, next) {
		users.update({ _id: id }, { $set: { pdate: now }}, next);
	};

	exports.updateUserStatus = function (id, status, next) {
		users.update({ _id: id }, { $set: { status: status }}, next);
	};

	exports.updateUser = function (id, fields, next) {
		users.update({ _id: id }, { $set: fields}, next);
	};

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

	exports.findPhotosByUser = function (uid, pg, pgsize) {
		var opt = {
			sort: { _id: -1 },
			skip: (Math.abs(pg) - 1) * pgsize,
			limit: pgsize
		};
		return photos.find({ uid: uid }, opt);
	};

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

	exports.insertReset = function (email, next) {
		exports.delReset(email, function (err) {
			if (err) return next(err);
			crypto.randomBytes(12, function(err, buf) {
				if (err) return next(err);
				var token = buf.toString('hex');
				resets.insert({ email: email, token: token }, next);
			});
		});
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
