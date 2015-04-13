var fs = require('fs');

var utilp = require('../base/util');
var init = require('../base/init');
var fsp = require('../base/fs');
var config = require('../base/config')({ path: 'config/test.json' });
var exp = require('../express/express');
var upload = require('../express/upload');
var local = require('../express/local');
var expect = require('../base/assert').expect

before(function (done) {
  init.run(done);
});

describe('parsing json', function () {
  it('given handler', function () {
    exp.core.post('/api/test/upload-json', upload.handler(function (req, res, done) {
      expect(req).json;
      req.body.files = req.files;
      res.json(req.body);
      done();
    }));
  });
  it('should success', function (done) {
    local.post('/api/test/upload-json').send({'p1': 'abc'}).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.files).undefined;
      expect(res.body.p1).equal('abc');
      done();
    });
  });
});

describe('parsing form', function () {
  it('given handler', function () {
    exp.core.post('/api/test/upload-form', upload.handler(function (req, res, done) {
      // RegExp 기능이 chai-http github 에는 커밋되어 있으나 npm 패키지엔 아직 적용이 안 되어 있다.
      // expect(req).header('content-type', /multipart/);
      expect(req.header('content-type')).contain('multipart');
      req.body.files = req.files;
      res.json(req.body);
      done();
    }));
  });
  it('should success', function (done) {
    local.post('/api/test/upload-form').field('p1', 'abc').field('p2', '123').field('p2', '456').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.files).eql({});
      expect(res.body.p1).equal('abc');
      expect(res.body.p2).eql(['123', '456']);
      done();
    });
  });
});

describe('parsing one file', function () {
  var f1 = 'modules/express/upload-fixture1.txt';
  var p1;
  it('given handler', function () {
    exp.core.post('/api/test/upload-one', upload.handler(function (req, res, done) {
      p1 = req.files.f1[0].path;
      expect(p1).pathExist;
      req.body.files = req.files;
      res.json(req.body);
      done();
    }));
  });
  it('should success', function (done) {
    local.post('/api/test/upload-one').field('p1', 'abc').attach('f1', f1).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.p1).equal('abc');
      expect(res.body.files.f1[0].safeFilename).equal('upload-fixture1.txt');
      expect(p1).not.pathExist;
      done();
    });
  });
});

describe('parsing two files', function () {
  var f1 = 'modules/express/upload-fixture1.txt';
  var f2 = 'modules/express/upload-fixture2.txt';
  var p1, p2;
  it('given handler', function () {
    exp.core.post('/api/test/upload-two', upload.handler(function (req, res, done) {
      p1 = req.files.f1[0].path;
      p2 = req.files.f1[1].path;
      expect(p1).pathExist;
      expect(p2).pathExist;
      req.body.files = req.files;
      res.json(req.body);
      done();
    }));
  });
  it('should success', function (done) {
    local.post('/api/test/upload-two').field('p1', 'abc').attach('f1', f1).attach('f1', f2).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.p1).equal('abc');
      expect(res.body.files.f1[0].safeFilename).equal('upload-fixture1.txt');
      expect(res.body.files.f1[1].safeFilename).equal('upload-fixture2.txt');
      setTimeout(function () {
        expect(p1).not.pathExist;
        expect(p2).not.pathExist;
        done();
      }, 100);
    });
  });
});

describe('parsing irregular filename', function () {
  var f1 = 'modules/express/upload-fixture1.txt';
  var p1;
  it('given handler', function () {
    exp.core.post('/api/test/upload-irregular', upload.handler(function (req, res, done) {
      p1 = req.files.f1[0].path;
      expect(p1).pathExist;
      req.body.files = req.files;
      res.json(req.body);
      done();
    }));
  });
  it('should success', function (done) {
    local.post('/api/test/upload-irregular').field('p1', 'abc').attach('f1', f1, 'file<>()[]_-=.txt.%$#@!&.txt').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.files.f1[0].safeFilename).equal('file__()[]_-=.txt.%$#@!&.txt');
      expect(res.body.p1).equal('abc');
      expect(p1).not.pathExist;
      done();
    });
  });
});

