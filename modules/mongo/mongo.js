var MongoClient = require('mongodb').MongoClient;
var Server = require('mongodb').Server;
var ObjectID = require('mongodb').ObjectID;

var init = require('../base/init');
var config = require('../base/config');

var opt = {};

exports = module.exports = function (_opt) {
  for(var p in _opt) {
    opt[p] = _opt[p];
  }
  return exports;
};

init.add(function (done) {
  
  function open(done) {
    var server = new Server('localhost', 27017, { auto_reconnect: true } );
    var client = new MongoClient(server);

    client.open(function (err) {
      var db = exports.db = client.db(config.mongoDb);
      console.log('mongo: ' + db.databaseName);
      if (config.mongoUser) {
        return db.authenticate(config.mongoUser, config.mongoPassword, function(err, res) {
          if (err) return done(err);
          done();
        });
      }
      done();
    });
  }

  function drop(done) {
    if (opt.dropDatabase) {
      return exports.db.dropDatabase(function (err) {
        if (err) return done(err);
        console.log('mongo: dropped db');
        done() 
      });
    }
    done();
  }

  open(function (err) {
    if (err) return done(err);
    drop(done);
  });
});

exports.ObjectID = ObjectID;

exports.findPage = function (collection, query, gt, lt, ps, filter, done) {
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
      if (err) return done(err);
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
            if (err) return done(err);
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
  
      done(null, results, gt, lt);
    });
  }

  read();
};

exports.forEach = function (col, doit, done) {
  var cursor = col.find();
  function read() {
    cursor.nextObject(function (err, user) {
      if (err) return done(err);
      if (user) {
        return doit(user, function (err) {
          if (err) return done(err);
          setImmediate(read);         
        });
      }
      done();
    });
  }
  read();
};
