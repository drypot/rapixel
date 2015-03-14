var should = require('should');

var util2 = require('../base/util');

describe("find", function () {
  it("should success", function () {
    var item = util2.find([ 1, 2, 3], function (item) {
      return item === 2;
    });
    item.should.equal(2);
  });
  it("should success", function () {
    var item = util2.find([ 1, 2, 3], function (item) {
      return item === 4;
    });
    should(item === null).true;
  });
});

describe("mergeObject", function () {
  it("should success", function () {
    var obj1 = { a: 1 };
    var obj2 = { b: 2 };
    util2.mergeObject(obj1, obj2);
    obj1.should.eql({ a: 1, b: 2 });
  });
  it("should success", function () {
    var obj1 = { };
    var obj2 = { a: 1 };
    var obj3 = { b: 2 };
    util2.mergeObject(obj1, obj2, obj3);
    obj1.should.eql({ a: 1, b: 2 });
  });
});

describe("pass", function () {
  it("should success", function (done) {
    util2.pass(function (err) {
      should.not.exist(err);
      done();
    });
  });
  it("should success", function (done) {
    util2.pass(1, 2, 3, function (err) {
      should.not.exist(err);
      done();
    });
  });
});

describe("toDateTimeString", function () {
  it("should success", function () {
    var d = new Date(1974, 4, 16, 12, 0);
    util2.toDateTimeString(d).should.equal('1974-05-16 12:00:00');
  })
});

describe("makeUrl", function () {
  it("should success", function () {
    var url = util2.makeUrl('http://localhost/test');
    url.should.equal('http://localhost/test');
  });
  it("should success", function () {
    var params = {
      a: 10
    };
    var url = util2.makeUrl('http://localhost/test', params);
    url.should.equal('http://localhost/test?a=10');
  });
  it("should success", function () {
    var params = {
      a: 10,
      b: 'big'
    };
    var url = util2.makeUrl('http://localhost/test', params);
    url.should.equal('http://localhost/test?a=10&b=big');
  });
});
