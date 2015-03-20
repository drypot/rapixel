var chai = require('chai');
var expect = chai.expect;
chai.config.includeStack = true;

var init = require('../base/init');

describe("sync init function", function () {
  it("should success", function (done) {
    var a = [];
    init.reset();
    init.add(function () {
      a.push(3);
    });
    init.add(function () {
      a.push(7);
    });
    init.run(function () {
      expect(a).length(2);
      expect(a[0]).equal(3);
      expect(a[1]).equal(7);
      done();
    });
  });
});

describe("async init function", function () {
  it("should success", function (done) {
    var a = [];
    init.reset();
    init.add(function (done) {
      a.push(33);
      done();
    });
    init.add(function (done) {
      a.push(77);
      done();
    });
    init.run(function () {
      expect(a).length(2);
      expect(a[0]).equal(33);
      expect(a[1]).equal(77);
      done();
    });
  });
});

describe("sync throw", function () {
  it("should success", function (done) {
    var a = [];
    init.reset();
    init.add(function () {
      a.push(3);
    });
    init.add(function (done) {
      try {
        throw new Error('critical');
        done();
      } catch (err) {
        done(err);
      }
    });
    init.run(function (err) {
      expect(a).length(1);
      expect(a[0]).equal(3);
      expect(err).exist;
      done();
    });
  });
});

describe("async throw", function () {
  it("should success", function (done) {
    var a = [];
    init.reset();
    init.add(function (done) {
      a.push(33);
      done();
    });
    init.add(function (done) {
      done(new Error('critical'));
    });
    init.run(function (err) {
      expect(a).length(1);
      expect(a[0]).equal(33);
      expect(err).exist;
      done();
    });
  });
});

describe("tail function", function () {
  it("should success", function (done) {
    var a = [];
    init.reset();
    init.add(function () {
      a.push(3);
    });
    init.tail(function () {
      a.push(10);
    });
    init.add(function () {
      a.push(7);
    });
    init.run(function () {
      expect(a).length(3);
      expect(a[0]).equal(3);
      expect(a[1]).equal(7);
      expect(a[2]).equal(10);
      done();
    });
  });
});
