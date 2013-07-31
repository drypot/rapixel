var MongoClient = require('mongodb').MongoClient;
var Server = require('mongodb').Server;
var ObjectID = require('mongodb').ObjectID;

var init = require('../lang/init');
var config = require('../config/config');

var opt = {};

exports = module.exports = function (_opt) {
	for(var p in _opt) {
		opt[p] = _opt[p];
	}
	return exports;
};

init.add(function (next) {
	
	function open(next) {
		var server = new Server('localhost', 27017, { auto_reconnect: true } );
		var client = new MongoClient(server);

		client.open(function (err) {
			var db = exports.db = client.db(config.data.mongoDb);
			console.log('mongo: ' + db.databaseName);
			if (config.data.mongoUser) {
				return db.authenticate(config.data.mongoUser, config.data.mongoPassword, function(err, res) {
					if (err) return next(err);
					next();
				});
			}
			next();
		});
	}

	function drop(next) {
		if (opt.dropDatabase) {
			return exports.db.dropDatabase(function (err) {
				if (err) return next(err);
				console.log('mongo: dropped db');
				next() 
			});
		}
		next();
	}

	open(function (err) {
		if (err) return next(err);
		drop(next);
	});
});

exports.ObjectID = ObjectID;

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

exports.forEach = function (col, doit, next) {
	var cursor = col.find();
	function read() {
		cursor.nextObject(function (err, user) {
			if (err) return next(err);
			if (user) {
				return doit(user, function (err) {
					if (err) return next(err);
					setImmediate(read);					
				});
			}
			next();
		});
	}
	read();
};
