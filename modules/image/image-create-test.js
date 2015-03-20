var chai = require('chai');
var expect = chai.expect;
chai.use(require('chai-http'));
chai.config.includeStack = true;

var fs = require('fs');

var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config')({ path: 'config/test.json' });
var mongo = require('../mongo/mongo')({ dropDatabase: true });
var express2 = require('../main/express');
var upload = require('../upload/upload');
var userf = require('../user/user-fixture');
var imageb = require('../image/image-base');
var imagec = require('../image/image-create');

var local = require('../main/local');

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
      count.should.equal(config.ticketMax);
      done();
    });
  });
  it("given a image out of time", function (done) {
    genImage(config.ticketGenInterval + 1, done);
  });
  it("should return ticketMax", function (done) {
    imagec.getTicketCount(_now, userf.user1, function (err, count, hours) {
      expect(err).not.exist;
      count.should.equal(config.ticketMax);
      done();
    });
  });
  it("given a image in time", function (done) {
    genImage(config.ticketGenInterval - 1, done);
  });
  it("should return (ticketMax - 1)", function (done) {
    imagec.getTicketCount(_now, userf.user1, function (err, count, hours) {
      expect(err).not.exist;
      count.should.equal(config.ticketMax - 1);
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
      count.should.equal(0);
      hours.should.equal(3);
      done();
    });
  });
});
