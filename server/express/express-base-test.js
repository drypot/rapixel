var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config')({ path: 'config/test.json' });
var expb = require('../express/express-base');
var expl = require('../express/express-local');
var expect = require('../base/assert2').expect;

before(function (done) {
  init.run(done);
});

describe('hello', function () {
  it('should return appName', function (done) {
    expl.get('/api/hello').end(function (err, res) {
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

describe('echo', function () {
  it('get should success', function (done) {
    expl.get('/api/echo?p1&p2=123').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.method).equal('GET');
      expect(res.body.query).eql({ p1: '', p2: '123' });
      done();
    });
  });
  it('post should success', function (done) {
    expl.post('/api/echo').send({ p1: '', p2: '123' }).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.method).equal('POST');
      expect(res.body.body).eql({ p1: '', p2: '123' });
      done();
    });
  });
  it('delete should success', function (done) {
    expl.del('/api/echo').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.method).equal('DELETE');
      done();
    });
  });
});

describe('undefined', function () {
  it('should return 404', function (done) {
    expl.get('/api/test/undefined-url').end(function (err, res) {
      expect(err).exist;
      expect(res).status(404); // Not Found
      done();
    });
  });
});

describe('json object', function () {
  it('given handler', function () {
    expb.core.get('/api/test/object', function (req, res, done) {
      res.json({ msg: 'valid json' });
    });
  });
  it('should return json', function (done) {
    expl.get('/api/test/object').end(function (err, res) {
      expect(err).not.exist;
      expect(res).json;
      expect(res.body.msg).equal('valid json');
      done();
    });
  });
});

describe('json string', function () {
  it('given handler', function () {
    expb.core.get('/api/test/string', function (req, res, done) {
      res.json('hi');
    });
  });
  it('should return json', function (done) {
    expl.get('/api/test/string').end(function (err, res) {
      expect(err).not.exist;
      expect(res).json;
      expect(res.body).equal('hi');
      done();
    });
  });
});

describe('json null', function () {
  it('given handler', function () {
    expb.core.get('/api/test/null', function (req, res, done) {
      res.json(null);
    });
  });
  it('should return {}', function (done) {
    expl.get('/api/test/null').end(function (err, res) {
      expect(err).not.exist;
      expect(res).json;
      expect(res.body).equal(null);
      done();
    });
  });
});

describe('no-action', function () {
  it('given handler', function () {
    expb.core.get('/api/test/no-action', function (req, res, done) {
      done();
    });
  });
  it('should return 404', function (done) {
    expl.get('/api/test/no-action').end(function (err, res) {
      expect(err).exist;
      expect(res).status(404); // Not Found
      done();
    });
  });
});

describe('json error', function () {
  it('given handler', function () {
    expb.core.get('/api/test/invalid-data', function (req, res, done) {
       done(error('INVALID_DATA'));
    });
  });
  it('should return json', function (done) {
    expl.get('/api/test/invalid-data').end(function (err, res) {
      expect(err).not.exist;
      expect(res).json;
      expect(res.body.err).exist;
      expect(res.body.err).error('INVALID_DATA');
      done();
    });
  });
});

describe('html', function () {
  it('given handler', function () {
    expb.core.get('/test/html', function (req, res, done) {
      res.send('<p>some text</p>');
    });
  });
  it('should return html', function (done) {
    expl.get('/test/html').end(function (err, res) {
      expect(err).not.exist;
      expect(res).html;
      expect(res.text).equal('<p>some text</p>');
      done();
    });
  });
});

describe('html error', function () {
  it('given handler', function () {
    expb.core.get('/test/invalid-data', function (req, res, done) {
       done(error('INVALID_DATA'));
    });
  });
  it('should return html', function (done) {
    expl.get('/test/invalid-data').end(function (err, res) {
      expect(err).not.exist;
      expect(res).html;
      expect(res.text).match(/.*INVALID_DATA.*/);
      done();
    });
  });
});

describe('cache control', function () {
  it('given handler', function () {
    expb.core.get('/test/cache-test', function (req, res, done) {
       res.send('<p>muse be cached</p>');
     });
  });
  it('none api request should return Cache-Control: private', function (done) {
    expl.get('/test/cache-test').end(function (err, res) {
      expect(err).not.exist;
      expect(res.get('Cache-Control')).equal('private');
      done();
    });
  });
  it('api should return Cache-Control: no-cache', function (done) {
    expl.get('/api/hello').end(function (err, res) {
      expect(err).not.exist;
      expect(res.get('Cache-Control')).equal('no-cache');
      done();
    });
  });
});

describe('session', function () {
  it('given handler', function () {
    expb.core.put('/api/test/session', function (req, res) {
      for (var key in req.body) {
        req.session[key] = req.body[key];
      }
      res.json({});
    });

    expb.core.get('/api/test/session', function (req, res) {
      var obj = {};
      for (var i = 0; i < req.body.length; i++) {
        var key = req.body[i];
        obj[key] = req.session[key];
      }
      res.json(obj);
    });
  });
  it('post should success', function (done) {
    expl.put('/api/test/session').send({ book: 'book1', price: 11 }).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it('get should success', function (done) {
    expl.get('/api/test/session').send([ 'book', 'price' ]).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body).property('book', 'book1');
      expect(res.body).property('price', 11);
      done();
    });
  });
  it('given session destroied', function (done) {
    expl.post('/api/test/destroy-session').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      done();
    });
  });
  it('get should fail', function (done) {
    expl.get('/api/test/session').send([ 'book', 'price' ]).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body).not.property('book');
      expect(res.body).not.property('price');
      done();
    });
  });
});

describe('middleware', function () {
  var result;
  it('given handlers', function () {
    function mid1(req, res, done) {
      result.mid1 = 'ok';
      done();
    }

    function mid2(req, res, done) {
      result.mid2 = 'ok';
      done();
    }
    
    function miderr(req, res, done) {
      done(new Error('some error'));
    }
    
    expb.core.get('/api/test/mw-1-2', mid1, mid2, function (req, res, done) {
      result.mid3 = 'ok';
      res.json({});
    });

    expb.core.get('/api/test/mw-1-err-2', mid1, miderr, mid2, function (req, res, done) {
      result.mid3 = 'ok';
      res.json({});
    });
  });
  it('mw-1-2 should return 1, 2', function (done) {
    result = {};
    expl.get('/api/test/mw-1-2').end(function (err, res) {
      expect(err).not.exist;
      expect(result.mid1).exist;
      expect(result.mid2).exist;
      expect(result.mid3).exist;
      done();
    });
  });
  it('mw-1-err-2 should return 1, 2', function (done) {
    result = {};
    expl.get('/api/test/mw-1-err-2').end(function (err, res) {
      expect(err).not.exist;
      expect(result.mid1).exist;
      expect(result.mid2).not.exist;
      expect(result.mid3).not.exist;
      done();
    });
  });
});
