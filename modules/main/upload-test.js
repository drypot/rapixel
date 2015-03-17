var should = require('should');
var fs = require('fs');

var util2 = require('../base/util');
var init = require('../base/init');
var fs2 = require('../base/fs');
var config = require('../base/config')({ path: 'config/rapixel-test.json' });
var express2 = require('../main/express');
var upload = require('../main/upload');

var local = require('../main/local');

function find(files, oname) {
  return util2.find(files, function (file) {
    return file.oname === oname;
  });
}

before(function (done) {
  init.run(done);
});

describe("deleter", function () {
  var _path1, _path2, _path3;

  it("given tmp files", function (done) {
    fs.writeFileSync(_path1 = upload.getTmpPath('f1.txt'), '');
    fs.writeFileSync(_path2 = upload.getTmpPath('f2.txt'), '');
    fs.writeFileSync(_path3 = upload.getTmpPath('f3.txt'), '');
    done();
  });
  it("can be checked", function (done) {
    fs.existsSync(_path1).should.be.true;
    fs.existsSync(_path2).should.be.true;
    fs.existsSync(_path3).should.be.true;
    done();
  });
  it("should success", function (_done) {
    var files = [
      { tpath: _path1 },
      { tpath: _path2 }
    ];
    var done = upload.deleter(files, function (err, param) {
      err.should.equal('errxx');
      param.should.equal('param1');
      _done();
    });
    done('errxx', 'param1');
  });
  it("can be checked", function (done) {
    fs.existsSync(_path1).should.be.false;
    fs.existsSync(_path2).should.be.false;
    fs.existsSync(_path3).should.be.true;
    done();
  });
});

describe("uploading one file", function () {
  it("should success", function (done) {
    var f1 = 'modules/upload/fixture/f1.txt';
    local.post('/api/upload').attach('files', f1).end(function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      should.not.exist(res.body.err);
      should.exist(res.body.files);
      var file;
      should.exist(file = find(res.body.files, 'f1.txt'));
      fs.existsSync(upload.getTmpPath(file.tname)).should.be.true;
      done();
    });
  });
});

describe("uploading two files", function () {
  it("should success", function (done) {
    var f1 = 'modules/upload/fixture/f1.txt';
    var f2 = 'modules/upload/fixture/f2.txt';
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

describe("uploading two files to html", function () {
  it("should success", function (done) {
    var f1 = 'modules/upload/fixture/f1.txt';
    var f2 = 'modules/upload/fixture/f2.txt';
    local.post('/api/upload?rtype=html').attach('files', f1).attach('files', f2).end(function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      should.not.exist(res.body.err);
      res.should.be.html;
      res.body = JSON.parse(res.text);
      var file;
      should.exist(file = find(res.body.files, 'f1.txt'));
      fs.existsSync(upload.getTmpPath(file.tname)).should.be.true;
      should.exist(file = find(res.body.files, 'f2.txt'));
      fs.existsSync(upload.getTmpPath(file.tname)).should.be.true;
      done();
    });
  });
});

describe("uploading none", function () {
  it("should success", function (done) {
    local.post('/api/upload').end(function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      should.not.exist(res.body.err);
      res.body.should.eql({});
      done();
    });
  });
});

describe("deleting files", function () {
  var _files;
  it("given three uploaded files", function (done) {
    var f1 = 'modules/upload/fixture/f1.txt';
    var f2 = 'modules/upload/fixture/f2.txt';
    var f3 = 'modules/upload/fixture/f3.txt';
    local.post('/api/upload').attach('files', f1).attach('files', f2).attach('files', f3).end(function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      should.not.exist(res.body.err);
      _files = res.body.files;
      for (var i = 0; i < _files.length; i++) {
        _files[i].tpath = upload.getTmpPath(_files[i].tname);
      };
      done();
    });
  });
  it("should success for f1.txt", function (done) {
    var f1;
    should.exist(f1 = find(_files, 'f1.txt'))
    fs.existsSync(f1.tpath).should.be.true;
    local.del('/api/upload').send({ files: [ f1.tname ] }).end(function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      should.not.exist(res.body.err);
      fs.existsSync(f1.tpath).should.be.false;
      done();
    });
  });
  it("should success for f2.txt and f3.txt", function (done) {
    var f2, f3;
    should.exist(f2 = find(_files, 'f2.txt'))
    fs.existsSync(f2.tpath).should.be.true;
    should.exist(f3 = find(_files, 'f3.txt'))
    fs.existsSync(f3.tpath).should.be.true;
    local.del('/api/upload').send({ files: [ f2.tname, f3.tname ] }).end(function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      should.not.exist(res.body.err);
      fs.existsSync(f2.tpath).should.be.false;
      fs.existsSync(f3.tpath).should.be.false;
      done();
    });
  });
  it("should success for invalid file", function (done) {
    local.del('/api/upload').send({ files: [ 'no-file.txt' ] }).end(function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      should.not.exist(res.body.err);
      done();
    });
  });
});

