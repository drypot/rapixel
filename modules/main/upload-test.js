var chai = require('chai');
var expect = chai.expect;
chai.use(require('chai-http'));
chai.config.includeStack = true;

var fs = require('fs');

var util2 = require('../base/util');
var init = require('../base/init');
var fs2 = require('../base/fs');
var config = require('../base/config')({ path: 'config/test.json' });
var express2 = require('../main/express');
var upload = require('../main/upload');
var local = require('../main/local');

var app;

init.add(function () {
  app = express2.app;
});

before(function (done) {
  init.run(done);
});

describe("parsing json", function () {
  it("given handler", function () {
    app.post('/api/test/upload-json', upload.handler(function (req, res, done) {
      expect(req).json;
      res.json({files: req.files, field: req.body.field});
      done();
    }));
  });
  it("should success", function (done) {
    local.post('/api/test/upload-json').send({'field': 'abc'}).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.files).not.exist;
      expect(res.body.field).equal('abc');
      done();
    });
  });
});

describe("parsing form", function () {
  it("given handler", function () {
    app.post('/api/test/upload-form', upload.handler(function (req, res, done) {
      // RegExp 기능이 github 에는 커밋되어 있으나 npm 패키지엔 아직 적용이 안 되어 있다.
      // expect(req).header('content-type', /multipart/);
      expect(req.header('content-type')).contain('multipart');
      res.json({files: req.files, field: req.body.field});
      done();
    }));
  });
  it("should success", function (done) {
    local.post('/api/test/upload-form').field('field', 'abc').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.files).eql({});
      expect(res.body.field).equal('abc');
      done();
    });
  });
});

describe("parsing one file", function () {
  var f1 = 'modules/main/upload-fixture1.txt';
  var p1;
  it("given handler", function () {
    app.post('/api/test/upload-one', upload.handler(function (req, res, done) {
      p1 = req.files.files[0].path;
      expect(fs.existsSync(p1)).true;
      res.json({files: req.files, field: req.body.field});
      done();
    }));
  });
  it("should success", function (done) {
    local.post('/api/test/upload-one').field('field', 'abc').attach('files', f1).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.files.files[0].safeFilename).equal('upload-fixture1.txt');
      expect(res.body.field).equal('abc');
      expect(fs.existsSync(p1)).false;
      done();
    });
  });
});

describe("parsing two files", function () {
  var f1 = 'modules/main/upload-fixture1.txt';
  var f2 = 'modules/main/upload-fixture2.txt';
  var p1, p2;
  it("given handler", function () {
    app.post('/api/test/upload-two', upload.handler(function (req, res, done) {
      p1 = req.files.files[0].path;
      p2 = req.files.files[1].path;
      expect(fs.existsSync(p1)).true;
      expect(fs.existsSync(p2)).true;
      res.json({files: req.files, field: req.body.field});
      done();
    }));
  });
  it("should success", function (done) {
    local.post('/api/test/upload-two').field('field', 'abc').attach('files', f1).attach('files', f2).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.files.files[0].safeFilename).equal('upload-fixture1.txt');
      expect(res.body.files.files[1].safeFilename).equal('upload-fixture2.txt');
      expect(res.body.field).equal('abc');
      setTimeout(function () {
        expect(fs.existsSync(p1)).false;
        expect(fs.existsSync(p2)).false;
        done();
      }, 100);
    });
  });
});

describe("parsing irregular filename", function () {
  var f1 = 'modules/main/upload-fixture1.txt';
  var p1;
  it("given handler", function () {
    app.post('/api/test/upload-irregular', upload.handler(function (req, res, done) {
      p1 = req.files.files[0].path;
      expect(fs.existsSync(p1)).true;
      res.json({files: req.files, field: req.body.field});
      done();
    }));
  });
  it("should success", function (done) {
    local.post('/api/test/upload-irregular').field('field', 'abc').attach('files', f1, 'file<>()[]_-=.txt.%$#@!&.txt').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.files.files[0].safeFilename).equal('file__()[]_-=.txt.%$#@!&.txt');
      expect(res.body.field).equal('abc');
      expect(fs.existsSync(p1)).false;
      done();
    });
  });
});