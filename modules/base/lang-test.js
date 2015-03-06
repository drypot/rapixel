var should = require('should');

var lang = require('../base/lang');

describe("find", function () {
  it("should success", function () {
    var item = lang.find([ 1, 2, 3], function (item) {
      return item === 2;
    });
    item.should.equal(2);
  });
  it("should success", function () {
    var item = lang.find([ 1, 2, 3], function (item) {
      return item === 4;
    });
    should(item === null);
  });
});

describe("merge", function () {
  it("should success", function () {
    var obj1 = { a: 1 };
    var obj2 = { b: 2 };
    lang.merge(obj1, obj2);
    obj1.should.eql({ a: 1, b: 2 });
  });
  it("should success", function () {
    var obj1 = { };
    var obj2 = { a: 1 };
    var obj3 = { b: 2 };
    lang.merge(obj1, obj2, obj3);
    obj1.should.eql({ a: 1, b: 2 });
  });
});

describe("pass", function () {
  it("should success", function (done) {
    lang.pass(function (err) {
      should(!err);
      done();
    });
  });
  it("should success", function (done) {
    lang.pass(1, 2, 3, function (err) {
      should(!err);
      done();
    });
  });
});
