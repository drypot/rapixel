var fs = require('fs');

var util2 = require('../base/util2');
var init = require('../base/init');
var fs2 = require('../base/fs2');
var config = require('../base/config')({ path: 'config/test.json' });
var expb = require('../express/express-base');
var expu = require('../express/express-upload');
var expl = require('../express/express-local');
var expect = require('../base/assert2').expect;

before(function (done) {
  init.run(done);
});

describe('parsing json', function () {
  it('given handler', function () {
    expb.core.post('/api/test/upload-json', expu.handler(function (req, res, done) {
      expect(req).json;
      req.body.files = req.files;
      res.json(req.body);
      done();
    }));
  });
  it('should success', function (done) {
    expl.post('/api/test/upload-json').send({'p1': 'abc'}).end(function (err, res) {
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
    expb.core.post('/api/test/upload-form', expu.handler(function (req, res, done) {
      // RegExp 기능이 chai-http github 에는 커밋되어 있으나 npm 패키지엔 아직 적용이 안 되어 있다.
      // expect(req).header('content-type', /multipart/);
      expect(req.header('content-type')).contain('multipart');
      req.body.files = req.files;
      res.json(req.body);
      done();
    }));
  });
  it('field should success', function (done) {
    expl.post('/api/test/upload-form').field('p1', 'abc').field('p2', '123').field('p2', '456').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.files).not.exist;
      expect(res.body.p1).equal('abc');
      expect(res.body.p2).eql(['123', '456']);
      done();
    });
  });
  it('fields should success', function (done) {
    var form = {
      p1: 'abc',
      p2: '123',
      p3: ['123', '456']
    }
    expl.post('/api/test/upload-form').fields(form).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.files).not.exist;
      expect(res.body.p1).equal('abc');
      expect(res.body.p2).equal('123');
      expect(res.body.p3).eql(['123', '456']);
      done();
    });
  });
});

describe('parsing one file', function () {
  var f1 = 'server/express/express-upload-f1.txt';
  var p1;
  it('given handler', function () {
    expb.core.post('/api/test/upload-one', expu.handler(function (req, res, done) {
      p1 = req.files.f1[0].path;
      expect(p1).pathExist;
      req.body.files = req.files;
      res.json(req.body);
      done();
    }));
  });
  it('should success', function (done) {
    expl.post('/api/test/upload-one').field('p1', 'abc').attach('f1', f1).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.p1).equal('abc');
      expect(res.body.files.f1[0].safeFilename).equal('express-upload-f1.txt');
      expect(p1).not.pathExist;
      done();
    });
  });
});

describe('parsing two files', function () {
  var f1 = 'server/express/express-upload-f1.txt';
  var f2 = 'server/express/express-upload-f2.txt';
  var p1, p2;
  it('given handler', function () {
    expb.core.post('/api/test/upload-two', expu.handler(function (req, res, done) {
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
    expl.post('/api/test/upload-two').field('p1', 'abc').attach('f1', f1).attach('f1', f2).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.p1).equal('abc');
      expect(res.body.files.f1[0].safeFilename).equal('express-upload-f1.txt');
      expect(res.body.files.f1[1].safeFilename).equal('express-upload-f2.txt');
      setTimeout(function () {
        expect(p1).not.pathExist;
        expect(p2).not.pathExist;
        done();
      }, 100);
    });
  });
});

describe('parsing irregular filename', function () {
  var f1 = 'server/express/express-upload-f1.txt';
  var p1;
  it('given handler', function () {
    expb.core.post('/api/test/upload-irregular', expu.handler(function (req, res, done) {
      p1 = req.files.f1[0].path;
      expect(p1).pathExist;
      req.body.files = req.files;
      res.json(req.body);
      done();
    }));
  });
  it('should success', function (done) {
    expl.post('/api/test/upload-irregular').field('p1', 'abc').attach('f1', f1, 'file<>()[]_-=.txt.%$#@!&.txt').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.files.f1[0].safeFilename).equal('file__()[]_-=.txt.%$#@!&.txt');
      expect(res.body.p1).equal('abc');
      expect(p1).not.pathExist;
      done();
    });
  });
});

