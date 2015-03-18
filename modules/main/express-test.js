var should = require('should');
var shouldhttp = require('should-http');
var express = require('express');

var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config')({ path: 'config/rapixel-test.json' });
var express2 = require('../main/express');
var local = require('../main/local');

var app;

init.add(function () {
  app = express.Router();
  express2.app.use(app);
});

before(function (done) {
  init.run(done);
});

describe("/api/hello", function () {
  it("should return appName", function (done) {
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

describe("undefined url", function () {
  it("should return 404", function (done) {
    local.get('/xxx').end(function (err, res) {
      should.not.exist(err);
      res.should.status(404); // Not Found
      res.error.status.should.eql(404);
      done();
    });
  });
});

describe("text-html", function () {
  it("given handler", function () {
    app.get('/test/text-html', function (req, res) {
      res.send('some text');
    });
  });
  it("should return html", function (done) {
    local.get('/test/text-html').end(function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      res.should.html;
      res.text.should.equal('some text');
      done();
    });
  });
});

describe("json", function () {
  it("given handler", function () {
    app.get('/api/json', function (req, res) {
      res.json({ msg: 'valid json' });
    });
  });
  it("should return json", function (done) {
    local.get('/api/json').end(function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      res.should.json;
      res.body.msg.should.equal('valid json');
      done();
    });
  });
});

describe("null", function () {
  it("given handler", function () {
    app.get('/api/null', function (req, res) {
      res.json(null);
    });
  });

  it("should return {}", function (done) {
    local.get('/api/null').end(function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      res.body.should.eql({});
      done();
    });
  });
});

describe("no-action", function () {
  it("given handler", function () {
    app.get('/test/no-action', function (req, res, done) {
      done();
    });
  });
  it("should return 404", function (done) {
    local.get('/test/no-action').end(function (err, res) {
      should.not.exist(err);
      res.should.status(404); // Not Found
      res.error.status.should.eql(404);
      done();
    });
  });
});

describe("INVALID_DATA", function () {
  it("given handler", function () {
    app.get('/api/invalid-data', function (req, res) {
       res.jsonErr(error(error.INVALID_DATA));
     });
  });
  it("should return INVALID_DATA", function (done) {
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

describe.only("Cache-Control", function () {
  it("none ajax request should return Cache-Control: private", function (done) {
    local.get('/api/hello').end(function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      res.get('Cache-Control').should.equal('private');
      done();
    });
  });
  it("ajax request should return Cache-Control: no-cache", function (done) {
    local.get('/api/hello').set('X-Requested-With', 'XMLHttpRequest').end(function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      res.get('Cache-Control').should.equal('no-cache');
      done();
    });
  });
});

describe("echo-query-params", function () {
  it("given handler", function () {
    app.get('/api/echo-query', function (req, res) {
      var obj = {};
      for(var p in req.query) {
        obj[p] = req.query[p];
      }
      res.json(obj);
    });
  });
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

describe.only("middleware", function () {
  var result;

  it("given handlers", function () {
    function mid1(req, res, done) {
      result.mid1 = 'ok';
      done();
    }

    function mid2(req, res, done) {
      result.mid2 = 'ok';
      done();
    }
    
    function miderr(req, res, done) {
      done(error(error.INVALID_DATA));
    }
    
    app.get('/api/mw-1-2', mid1, mid2, function (req, res) {
      result.mid3 = 'ok';
      res.json({});
    });

    app.get('/api/mw-1-err-2', mid1, miderr, mid2, function (req, res) {
      result.mid3 = 'ok';
      res.json({});
    });
  });
  it("mw-1-2 should return 1, 2", function (done) {
    result = {};
    local.get('/api/mw-1-2').end(function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      should.exist(result.mid1);
      should.exist(result.mid2);
      should.exist(result.mid3);
      done();
    });
  });
  it("mw-1-err-2 should return 1, 2", function (done) {
    result = {};
    local.get('/api/mw-1-err-2').end(function (err, res) {
      should.not.exist(err);
      res.error.should.ok;
      should.exist(result.mid1);
      should.not.exist(result.mid2);
      should.not.exist(result.mid3);
      done();
    });
  });
});
