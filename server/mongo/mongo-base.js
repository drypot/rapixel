var mongo = require('mongodb');
var expect = require('../base/assert2').expect;

var init = require('../base/init');
var config = require('../base/config');

var opt = {};

var mongob = exports = module.exports = function (_opt) {
  for(var p in _opt) {
    opt[p] = _opt[p];
  }
  return mongob;
};

// db

init.add(function (done) {
  expect(config.mongodb).exist;
  mongo.MongoClient.connect('mongodb://localhost:27017/' + config.mongodb, function(err, db) {
    if (err) return done(err);
    mongob.db = db;
    console.log('mongo: ' + mongob.db.databaseName);
    if (config.mongoUser) {
      mongob.db.authenticate(config.mongoUser, config.mongoPassword, done);
    } else {
      done();
    }    
  });
});

init.add(function (done) {
  if (opt.dropDatabase) {
    console.log('mongo: dropping db');
    mongob.db.dropDatabase(done);
  } else {
    done();
  }
});

mongob.ObjectID = mongo.ObjectID;

// utilities

// _id 를 숫자로 쓰는 컬렉션만 페이징할 수 있다.

mongob.findPage = function (col, query, gt, lt, ps, filter, done) {
  
  readPage(getCursor());

  function getCursor() {
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
    return col.find(query, opt);
  }

  function readPage(cursor) {
    var results = [];
    var count = 0, first = 0, last = 0;

    (function read() {
      cursor.nextObject(function (err, result) {
        if (err) return done(err);
        if (result) {
          count++;
          if (count > ps) {
            return returnPage(true);
          }
          if (!first) first = result._id;
          last = result._id;
          if (filter) {
            filter(result, function (err, result) {
              if (err) return done(err);
              if (result) fillResults(result);
              setImmediate(read);
            });
          } else {
            fillResults(result);
            setImmediate(read);
          }
          return;
        }
        returnPage(false);
      });
    })();

    function fillResults(result) {
      if (gt) {
        results.unshift(result);
      } else {
        results.push(result);
      }
    }
    
    function returnPage(more) {
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
    }
  }

};

mongob.forEach = function (col, doit, done) {
  var cursor = col.find();
  (function read() {
    cursor.nextObject(function (err, obj) {
      if (err) return done(err);
      if (obj) {
        doit(obj, function (err) {
          if (err) return done(err);
          setImmediate(read);         
        });
        return;
      }
      done();
    });
  })();
};

mongob.getLastId = function (col, done) {
  var opt = { fields: { _id: 1 }, sort: { _id: -1 }, limit: 1 };
  col.find({}, opt).nextObject(function (err, obj) {
    done(err, obj ? obj._id : 0);
  });
};
