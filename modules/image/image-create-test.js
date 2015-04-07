var chai = require('chai');
var expect = chai.expect;
chai.use(require('chai-http'));
chai.config.includeStack = true;

var fs = require('fs');

var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config')({ path: 'config/test.json' });
var mongop = require('../mongo/mongo')({ dropDatabase: true });
var exp = require('../express/express');
var upload = require('../express/upload');
var userf = require('../user/user-fixture');
var imageb = require('../image/image-base');
var imagec = require('../image/image-create');
var local = require('../express/local');

before(function (done) {
  init.run(done);
});

before(function (done) {
  userf.login('user1', done);
});

var _now = new Date();

function genImage(hours, count, done) {
  if (typeof count == 'function') {
    done = count;
    count = 1;
  }
  var images = [];
  for (var i = 0; i < count; i++) {
    var image = {
      _id: imageb.newId(),
      uid: userf.user1._id,
      cdate: new Date(_now.getTime() - (hours * 60 * 60 * 1000))
    };
    images.push(image);
  }
  imageb.images.insert(images, done);
}

describe("getTicketCount", function () {
  it("given emtpy images", function (done) {
    imageb.images.remove(done);
  });
  it("should return ticketMax", function (done) {
    imagec.getTicketCount(_now, userf.user1, function (err, count, hours) {
      expect(err).not.exist;
      expect(count).equal(config.ticketMax);
      done();
    });
  });
  it("given a image out of time", function (done) {
    genImage(config.ticketGenInterval + 1, done);
  });
  it("should return ticketMax", function (done) {
    imagec.getTicketCount(_now, userf.user1, function (err, count, hours) {
      expect(err).not.exist;
      expect(count).equal(config.ticketMax);
      done();
    });
  });
  it("given a image in time", function (done) {
    genImage(config.ticketGenInterval - 1, done);
  });
  it("should return (ticketMax - 1)", function (done) {
    imagec.getTicketCount(_now, userf.user1, function (err, count, hours) {
      expect(err).not.exist;
      expect(count).equal(config.ticketMax - 1);
      done();
    });
  });
  it("given emtpy images", function (done) {
    imageb.images.remove(done);
  });
  it("given ticketMax images in time", function (done) {
    genImage(config.ticketGenInterval - 3, config.ticketMax, done);
  });
  it("should return 0 and hours", function (done) {
    imagec.getTicketCount(_now, userf.user1, function (err, count, hours) {
      expect(err).not.exist;
      expect(count).equal(0);
      expect(hours).equal(3);
      done();
    });
  });
});

describe("posting text", function () {
  before(function (done) {
    imageb.images.remove(done);
  });
  it("should fail", function (done) {
    this.timeout(30000);
    local.post('/api/images').attach('files', 'modules/express/upload-fixture1.txt').end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      expect(error.find(res.body.err, error.IMAGE_TYPE)).true;
      done();
    });
  });
});

describe("posting no file", function () {
  before(function (done) {
    imageb.images.remove(done);
  }); 
  it("should fail", function (done) {
    var form = { };
    local.post('/api/images').send(form).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).exist;
      expect(error.find(res.body.err, error.IMAGE_NO_FILE)).true;
      done();
    });
  });
});

