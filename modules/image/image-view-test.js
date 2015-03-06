var should = require('should');

var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config')({ path: 'config/rapixel-test.json' });
var mongo = require('../mongo/mongo')({ dropDatabase: true });
var express2 = require('../main/express');
var upload = require('../upload/upload');
var userf = require('../user/user-fixture');
var imagec = require('../image/image-create');
var imagev = require('../image/image-view');

before(function (done) {
  init.run(done);
});

before(function () {
  express2.app.listen();
});

before(function (done) {
  userf.loginUser1(done);
});

describe("get image", function () {
  var _f1 = 'samples/3840x2160-169.jpg';
  var _pid;
  var _files;
  it("given tmp file", function (done) {
    local.post('/api/upload').attach('files', _f1).end(function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      should.not.exist(res.body.err);
      _files = res.body.files;
      done();
    });
  });
  it("given new image", function (done) {
    this.timeout(30000);
    var form = { files: _files, comment: 'image1' };
    local.post('/api/images').send(form).end(function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      should.not.exist(res.body.err);
      should.exist(res.body.ids);
      res.body.ids.length.should.equal(1);
      _pid = res.body.ids[0];
      done();
    });
  });
  it("should success", function (done) {
    local.get('/api/images/' + _pid).end(function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      should.not.exist(res.body.err);
      res.body.hit.should.equal(0);
      done();
    });
  });
  it("should success with hit", function (done) {
    local.get('/api/images/' + _pid + '?hit').end(function (err, res) {
      should.not.exist(err);
      res.error.should.false;
      should.not.exist(res.body.err);
      res.body.hit.should.equal(1);
      done();
    });
  });
});

