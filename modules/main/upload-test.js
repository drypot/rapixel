var should = require('should');
var fs = require('fs');
var express = require('express');

var util2 = require('../base/util');
var init = require('../base/init');
var fs2 = require('../base/fs');
var config = require('../base/config')({ path: 'config/rapixel-test.json' });
var express2 = require('../main/express');
var upload = require('../main/upload');
var local = require('../main/local');

var app;

// function find(files, oname) {
//   return util2.find(files, function (file) {
//     return file.safeFilename === oname;
//   });
// }

init.add(function () {
  app = express.Router();
  express2.app.use(app);
});

before(function (done) {
  init.run(done);
});

describe("uploading json", function () {
  it("given handler", function () {
    app.post('/api/test/upload-json', upload.handler(function (req, res, done) {
      req.get('content-type').should.equal('application/json');
      res.json({files: req.files, field: req.body.field});
      done();
    }));
  });
  it("should success", function (done) {
    local.post('/api/test/upload-json').send({'field': 'abc'}).end(function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      should.not.exist(res.body.err);
      should.not.exist(res.body.files);
      res.body.field.should.equal('abc');
      done();
    });
  });
});

describe.only("uploading no file", function () {
  it("given handler", function () {
    app.post('/api/test/upload-none', upload.handler(function (req, res, done) {
      req.get('content-type').should.startWith('multipart/form-data');
      res.json({files: req.files, field: req.body.field});
      done();
    }));
  });
  it("should success", function (done) {
    local.post('/api/test/upload-none').field('field', 'abc').end(function (err, res) {
      should.not.exist(err);
      should('abc').not.exist;
      res.error.should.false;

      should.not.exist(res.body.err);
      res.body.files.should.eql({});
      res.body.field.should.equal('abc');
      done();
    });
  });
});

describe("uploading one file", function () {
  var f1 = 'modules/main/upload-fixture1.txt';
  var p1;
  it("given handler", function () {
    app.post('/api/test/upload-one', upload.handler(function (req, res, done) {
      p1 = req.files.files[0].path;
      fs.existsSync(p1).should.true;
      res.json({files: req.files, field1: req.body.field1});
      done();
    }));
  });
  it("should success", function (done) {
    local.post('/api/test/upload-one').field('field1', 'abc').attach('files', f1).end(function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      should.not.exist(res.body.err);
      res.body.files.files[0].safeFilename.should.equal('upload-fixture1.txt');
      res.body.field1.should.equal('abc');
      fs.existsSync(p1).should.false;
      done();
    });
  });
});

describe("uploading two files", function () {
  it("should success", function (done) {
    var f1 = 'modules/main/upload-fixture1.txt';
    var f2 = 'modules/main/upload-fixture2.txt';
    local.post('/api/upload').attach('files', f1).attach('files', f2).end(function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      should.not.exist(res.body.err);
      var file;
      should.exist(file = find(res.body.files, 'f1.txt'));
      fs.existsSync(upload.getTmpPath(file.tname)).should.be.true;
      should.exist(file = find(res.body.files, 'f2.txt'));
      fs.existsSync(upload.getTmpPath(file.tname)).should.be.true;
      done();
    });
  });
});



