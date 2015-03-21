var chai = require('chai');
var expect = chai.expect;
chai.use(require('chai-http'));
chai.config.includeStack = true;

var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config')({ path: 'config/test.json' });
var express2 = require('../main/express');
var local = require('../main/local');

var app;

init.add(function () {
  app = express2.app;
});

before(function (done) {
  init.run(done);
});

describe("/api/hello", function () {
  it("should return appName", function (done) {
    local.get('/api/hello').end(function (err, res) {
      expect(err).not.exist;
      expect(res).json;
      expect(res.body.name).equal(config.appName);
      var stime = parseInt(res.body.time || 0);
      var ctime = Date.now();
      expect(stime <= ctime).true;
      expect(stime >= ctime - 100).true;
      done();
    });
  });
});

describe("undefined url", function () {
  it("should return 404", function (done) {
    local.get('/api/xxx').end(function (err, res) {
      expect(err).exist;
      expect(res).status(404); // Not Found
      done();
    });
  });
});

describe("res.send", function () {
  it("given handler", function () {
    app.get('/test/text-html', function (req, res, done) {
      res.send('<p>some text</p>');
    });
  });
  it("should return html", function (done) {
    local.get('/test/text-html').end(function (err, res) {
      expect(err).not.exist;
      expect(res).html;
      expect(res.text).equal('<p>some text</p>');
      done();
    });
  });
});

describe("res.json", function () {
  it("given handler", function () {
    app.get('/api/json', function (req, res, done) {
      res.json({ msg: 'valid json' });
    });
  });
  it("should return json", function (done) {
    local.get('/api/json').end(function (err, res) {
      expect(err).not.exist;
      expect(res).json;
      expect(res.body.msg).equal('valid json');
      done();
    });
  });
});

describe("null", function () {
  it("given handler", function () {
    app.get('/api/null', function (req, res, done) {
      res.json(null);
    });
  });
  it("should return {}", function (done) {
    local.get('/api/null').end(function (err, res) {
      expect(err).not.exist;
      expect(res).json;
      expect(res.body).equal(null);
      done();
    });
  });
});

describe("no-action", function () {
  it("given handler", function () {
    app.get('/api/test/no-action', function (req, res, done) {
      done();
    });
  });
  it("should return 404", function (done) {
    local.get('/api/test/no-action').end(function (err, res) {
      expect(err).exist;
      expect(res).status(404); // Not Found
      done();
    });
  });
});

describe("api error", function () {
  it("given handler", function () {
    app.get('/api/test/invalid-data', function (req, res, done) {
       done(error(error.INVALID_DATA));
    });
  });
  it("should return json", function (done) {
    local.get('/api/test/invalid-data').end(function (err, res) {
      expect(err).not.exist;
      expect(res).json;
      expect(res.body.err).exist;
      expect(error.find(res.body.err, error.INVALID_DATA)).true;
      done();
    });
  });
});

describe("page error", function () {
  it("given handler", function () {
    app.get('/test/invalid-data', function (req, res, done) {
       done(error(error.INVALID_DATA));
    });
  });
  it("should return html", function (done) {
    local.get('/test/invalid-data').end(function (err, res) {
      expect(err).not.exist;
      expect(res).html;
      expect(res.text).match(/.*INVALID_DATA.*/);
      done();
    });
  });
});

describe("Cache-Control", function () {
  it("given handler", function () {
    app.get('/test/cache-test', function (req, res, done) {
       res.send('<p>muse be cached</p>');
     });
  });
  it("none api request should return Cache-Control: private", function (done) {
    local.get('/test/cache-test').end(function (err, res) {
      expect(err).not.exist;
      expect(res.get('Cache-Control')).equal('private');
      done();
    });
  });
  it("api should return Cache-Control: no-cache", function (done) {
    local.get('/api/hello').end(function (err, res) {
      expect(err).not.exist;
      expect(res.get('Cache-Control')).equal('no-cache');
      done();
    });
  });
});

describe("echo-query-params", function () {
  it("given handler", function () {
    app.get('/api/echo-query', function (req, res, done) {
      var obj = {};
      for(var p in req.query) {
        obj[p] = req.query[p];
      }
      res.json(obj);
    });
  });
  it("should success", function (done) {
    local.get('/api/echo-query?p1&p2=123').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body).eql({
        p1: '',
        p2: '123'
      });
      done();
    });
  });
});

describe("middleware", function () {
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
      done(new Error("some error"));
    }
    
    app.get('/api/mw-1-2', mid1, mid2, function (req, res, done) {
      result.mid3 = 'ok';
      res.json({});
    });

    app.get('/api/mw-1-err-2', mid1, miderr, mid2, function (req, res, done) {
      result.mid3 = 'ok';
      res.json({});
    });
  });
  it("mw-1-2 should return 1, 2", function (done) {
    result = {};
    local.get('/api/mw-1-2').end(function (err, res) {
      expect(err).not.exist;
      expect(result.mid1).exist;
      expect(result.mid2).exist;
      expect(result.mid3).exist;
      done();
    });
  });
  it("mw-1-err-2 should return 1, 2", function (done) {
    result = {};
    local.get('/api/mw-1-err-2').end(function (err, res) {
      expect(err).not.exist;
      expect(result.mid1).exist;
      expect(result.mid2).not.exist;
      expect(result.mid3).not.exist;
      done();
    });
  });
});
