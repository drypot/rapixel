var chai = require('chai');
var expect = chai.expect;
chai.use(require('chai-http'));
chai.config.includeStack = true;

var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config')({ path: 'config/test.json' });
var exp = require('../main/express');
var local = require('../main/local');

before(function (done) {
  init.run(done);
});

describe("hello", function () {
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

describe("echo", function () {
  it("get should success", function (done) {
    local.get('/api/echo?p1&p2=123').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.method).equal('GET');
      expect(res.body.query).eql({ p1: '', p2: '123' });
      done();
    });
  });
  it("post should success", function (done) {
    local.post('/api/echo').send({ p1: '', p2: '123' }).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.method).equal('POST');
      expect(res.body.body).eql({ p1: '', p2: '123' });
      done();
    });
  });
  it("delete should success", function (done) {
    local.del('/api/echo').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.method).equal('DELETE');
      done();
    });
  });
});


describe("undefined", function () {
  it("should return 404", function (done) {
    local.get('/api/test/undefined-url').end(function (err, res) {
      expect(err).exist;
      expect(res).status(404); // Not Found
      done();
    });
  });
});

describe("json object", function () {
  it("given handler", function () {
    exp.core.get('/api/test/object', function (req, res, done) {
      res.json({ msg: 'valid json' });
    });
  });
  it("should return json", function (done) {
    local.get('/api/test/object').end(function (err, res) {
      expect(err).not.exist;
      expect(res).json;
      expect(res.body.msg).equal('valid json');
      done();
    });
  });
});

describe("json string", function () {
  it("given handler", function () {
    exp.core.get('/api/test/string', function (req, res, done) {
      res.json('hi');
    });
  });
  it("should return json", function (done) {
    local.get('/api/test/string').end(function (err, res) {
      expect(err).not.exist;
      expect(res).json;
      expect(res.body).equal('hi');
      done();
    });
  });
});

describe("json null", function () {
  it("given handler", function () {
    exp.core.get('/api/test/null', function (req, res, done) {
      res.json(null);
    });
  });
  it("should return {}", function (done) {
    local.get('/api/test/null').end(function (err, res) {
      expect(err).not.exist;
      expect(res).json;
      expect(res.body).equal(null);
      done();
    });
  });
});

describe("no-action", function () {
  it("given handler", function () {
    exp.core.get('/api/test/no-action', function (req, res, done) {
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

describe("json error", function () {
  it("given handler", function () {
    exp.core.get('/api/test/invalid-data', function (req, res, done) {
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

describe("html", function () {
  it("given handler", function () {
    exp.core.get('/test/html', function (req, res, done) {
      res.send('<p>some text</p>');
    });
  });
  it("should return html", function (done) {
    local.get('/test/html').end(function (err, res) {
      expect(err).not.exist;
      expect(res).html;
      expect(res.text).equal('<p>some text</p>');
      done();
    });
  });
});

describe("html error", function () {
  it("given handler", function () {
    exp.core.get('/test/invalid-data', function (req, res, done) {
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

describe("cache control", function () {
  it("given handler", function () {
    exp.core.get('/test/cache-test', function (req, res, done) {
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
    
    exp.core.get('/api/test/mw-1-2', mid1, mid2, function (req, res, done) {
      result.mid3 = 'ok';
      res.json({});
    });

    exp.core.get('/api/test/mw-1-err-2', mid1, miderr, mid2, function (req, res, done) {
      result.mid3 = 'ok';
      res.json({});
    });
  });
  it("mw-1-2 should return 1, 2", function (done) {
    result = {};
    local.get('/api/test/mw-1-2').end(function (err, res) {
      expect(err).not.exist;
      expect(result.mid1).exist;
      expect(result.mid2).exist;
      expect(result.mid3).exist;
      done();
    });
  });
  it("mw-1-err-2 should return 1, 2", function (done) {
    result = {};
    local.get('/api/test/mw-1-err-2').end(function (err, res) {
      expect(err).not.exist;
      expect(result.mid1).exist;
      expect(result.mid2).not.exist;
      expect(result.mid3).not.exist;
      done();
    });
  });
});
