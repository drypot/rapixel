var expect = require('../base/chai').expect;

var init = require('../base/init');
var config = require('../base/config')({ path: 'config/test.json' });
var mongop = require('../mongo/mongo')({ dropDatabase: true });

before(function (done) {
  init.run(done);
});

describe('db', function () {
  it('should have been opened.', function () {
    expect(mongop.db.databaseName).equal(config.mongodb);
  });
});

describe('paging', function () {
  var col;
  it('given 10 records', function (done) {
    col = mongop.db.collection('testpaging');
    var list = [];
    for (var i = 0; i < 10; i++) {
      list.push({ _id: i + 1});
    };
    col.insertMany(list, done);    
  });
  it('page size 99 should success', function (done) {
    mongop.findPage(col, {}, 0, 0, 99, null, function (err, results, gt, lt) {
      expect(err).not.exist;
      expect(results.length).equal(10);
      expect(results[0]._id).equal(10);
      expect(results[1]._id).equal(9);
      expect(results[2]._id).equal(8);
      expect(results[9]._id).equal(1);
      expect(gt).equal(0);
      expect(lt).equal(0);
      done();
    });
  });
  it('page 1 should success', function (done) {
    mongop.findPage(col, {}, 0, 0, 4, null, function (err, results, gt, lt) {
      expect(err).not.exist;
      expect(results).length(4);
      expect(results[0]._id).equal(10);
      expect(results[3]._id).equal(7);
      expect(gt).equal(0);
      expect(lt).equal(7);
      done();
    });
  });
  it('page 2 with lt should success', function (done) {
    mongop.findPage(col, {}, 0, 7, 4, null, function (err, results, gt, lt) {
      expect(err).not.exist;
      expect(results).length(4);
      expect(results[0]._id).equal(6);
      expect(results[3]._id).equal(3);
      expect(gt).equal(6);
      expect(lt).equal(3);
      done();
    });
  });
  it('last page should success', function (done) {
    mongop.findPage(col, {}, 0, 3, 4, null, function (err, results, gt, lt) {
      expect(err).not.exist;
      expect(results).length(2);
      expect(results[0]._id).equal(2);
      expect(results[1]._id).equal(1);
      expect(gt).equal(2);
      expect(lt).equal(0);
      done();
    });
  });
  it('page 2 with gt should success', function (done) {
    mongop.findPage(col, {}, 2, 0, 4, null, function (err, results, gt, lt) {
      expect(err).not.exist;
      expect(results).length(4);
      expect(results[0]._id).equal(6);
      expect(results[3]._id).equal(3);
      expect(gt).equal(6);
      expect(lt).equal(3);
      done();
    });
  });
  it('first page should success', function (done) {
    mongop.findPage(col, {}, 6, 0, 4, null, function (err, results, gt, lt) {
      expect(err).not.exist;
      expect(results).length(4);
      expect(results[0]._id).equal(10);
      expect(results[3]._id).equal(7);
      expect(gt).equal(0);
      expect(lt).equal(7);
      done();
    });
  });
  it('filter should success', function (done) {
    mongop.findPage(col, {}, 0, 0, 5, filter, function (err, results, gt, lt) {
      expect(err).not.exist;
      expect(results).length(2);
      expect(results[0]._id).equal(9);
      expect(results[1]._id).equal(7);
      expect(gt).equal(0);
      expect(lt).equal(6);
      done();
    });
    function filter(result, done) {
      done(null, result._id % 2 ? result : null);
    }
  });
});

describe('getLastId', function () {
  var col;
  it('given empty collection', function () {
    col = mongop.db.collection('testlastid');
  });
  it('should success', function (done) {
    mongop.getLastId(col, function (err, id) {
      expect(err).not.exist;
      expect(id).equal(0);
      done();
    });
  });
  it('given 10 records', function (done) {
    var list = [];
    for (var i = 0; i < 10; i++) {
      list.push({ _id: i + 1});
    };
    col.insertMany(list, done);    
  });
  it('should success', function (done) {
    mongop.getLastId(col, function (err, id) {
      expect(err).not.exist;
      expect(id).equal(10);
      done();
    });
  });
});
