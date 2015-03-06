var should = require('should');
var shouldhttp = require('should-http');

var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config')({ path: 'config/rapixel-test.json' });
var express2 = require('../main/express');
var local = require('../main/local');

init.add(function () {
  var app = express2.app;

  app.get('/test/no-action', function (req, res, done) {
    done();
  });

  app.get('/test/plain-text', function (req, res) {
    res.send('some text');
  });

  app.get('/api/invalid-data', function (req, res) {
    res.jsonErr(error(error.INVALID_DATA));
  });

  app.get('/api/json', function (req, res) {
    res.json({});
  });

  app.get('/api/null', function (req, res) {
    res.json(null);
  });

  app.get('/api/echo-query', function (req, res) {
    var obj = {};
    for(var p in req.query) {
      obj[p] = req.query[p];
    }
    res.json(obj);
  });
});

before(function (done) {
  init.run(done);
});

describe("/api/hello", function () {
  it("should return 'hello'", function (done) {
    local.get('/api/hello').end(function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      res.should.be.json;
      res.body.name.should.equal(config.appName);
      var stime = parseInt(res.body.time || 0);
      var ctime = Date.now();
      (stime <= ctime).should.true;
      (stime >= ctime - 100).should.true;
      done();
    });
  });
});

describe("no-action", function () {
  it("should return not found", function (done) {
    local.get('/no-action').end(function (err, res) {
      should.not.exist(err);
      res.should.status(404);
      done();
    });
  });
});

describe("plain-text", function () {
  it("should return 'hello'", function (done) {
    local.get('/test/plain-text').end(function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      res.text.should.equal('some text');
      done();
    });
  });
});

describe("invalid-data", function () {
  it("should return code", function (done) {
    local.get('/api/invalid-data').end(function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      res.should.be.json;
      should.exist(res.body.err);
      error.find(res.body.err, error.INVALID_DATA).should.true;
      done();
    });
  });
});

describe("Cache-Control test", function () {
  describe("/test/hello", function () {
    it("should return private", function (done) {
      local.get('/test/plain-text').end(function (err, res) {
        should.not.exist(err);
        res.error.should.false;
        res.get('Cache-Control').should.equal('private');
        done();
      });
    });
  });
  describe("/api/json", function () {
    it("should return private", function (done) {
      local.get('/api/json').end(function (err, res) {
        should.not.exist(err);
        res.error.should.false;
        res.get('Cache-Control').should.equal('no-cache');
        done();
      });
    });
  });
});

describe("null", function () {
  it("should return {}", function (done) {
    local.get('/api/null').end(function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      res.body.should.eql({});
      done();
    });
  });
});

describe("echo-query-params", function () {
  it("should success", function (done) {
    local.get('/api/echo-query?p1&p2=123').end(function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      res.body.should.eql({
        p1: '',
        p2: '123'
      });
      done();
    });
  });
});

