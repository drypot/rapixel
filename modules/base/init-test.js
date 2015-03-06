var should = require('should');

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
      a.should.length(2);
      a[0].should.equal(3);
      a[1].should.equal(7);
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
      a.should.length(2);
      a[0].should.equal(33);
      a[1].should.equal(77);
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
      a.should.length(1);
      a[0].should.equal(3);
      should.exists(err);
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
      a.should.length(1);
      a[0].should.equal(33);
      should.exists(err);
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
    init.addTail(function () {
      a.push(10);
    });
    init.add(function () {
      a.push(7);
    });
    init.run(function () {
      a.should.length(3);
      a[0].should.equal(3);
      a[1].should.equal(7);
      a[2].should.equal(10);
      done();
    });
  });
});
