var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config')({ path: 'config/test.json' });
var mongob = require('../mongo/mongo-base')({ dropDatabase: true });
var expb = require('../express/express-base');
var expu = require('../express/express-upload');
var expl = require('../express/express-local');
var userf = require('../user/user-fixture');
var imageb = require('../image/image-base');
var imagel = require('../image/image-list');
var expect = require('../base/assert2').expect;

before(function (done) {
  init.run(done);
});

before(function (done) {
  userf.login('user1', done);
});

describe('listing', function (done) {
  it('given 10 images', function (done) {
    var images = [];
    for (var i = 0; i < 10; i++) {
      var image = {
        _id: imageb.getNewId(),
        uid: userf.user1._id,
        cdate: new Date(),
        comment: '' + i
      };
      images.push(image);
    };
    imageb.images.insertMany(images, done);    
  });
  it('page size 99 should succeed', function (done) {
    var query = {
      ps: 99
    }
    expl.get('/api/images').query(query).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.gt).equal(0);
      expect(res.body.lt).equal(0);
      expect(res.body.images.length).equal(10);
      expect(res.body.images[0]._id).equal(10);
      expect(res.body.images[1]._id).equal(9);
      expect(res.body.images[2]._id).equal(8);
      expect(res.body.images[9]._id).equal(1);
      done();
    });
  });
  it('page 1 should succeed', function (done) {
    var query = {
      ps: 4
    };
    expl.get('/api/images').query(query).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.gt).equal(0);
      expect(res.body.lt).equal(7);
      expect(res.body.images).length(4);
      expect(res.body.images[0]._id).equal(10);
      expect(res.body.images[3]._id).equal(7);
      done();
    });
  });
  it('page 2 with lt should succeed', function (done) {
    var query = {
      lt:7, ps: 4
    }
    expl.get('/api/images').query(query).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.gt).equal(6);
      expect(res.body.lt).equal(3);
      expect(res.body.images).length(4);
      expect(res.body.images[0]._id).equal(6);
      expect(res.body.images[3]._id).equal(3);
      done();
    });
  });
  it('last page should succeed', function (done) {
    var query = {
      lt: 3, ps: 4
    }
    expl.get('/api/images').query(query).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.gt).equal(2);
      expect(res.body.lt).equal(0);
      expect(res.body.images).length(2);
      expect(res.body.images[0]._id).equal(2);
      expect(res.body.images[1]._id).equal(1);
      done();
    });
  });
  it('page 2 with gt should succeed', function (done) {
    var query = {
      gt:2, ps: 4
    }
    expl.get('/api/images').query(query).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.gt).equal(6);
      expect(res.body.lt).equal(3);
      expect(res.body.images).length(4);
      expect(res.body.images[0]._id).equal(6);
      expect(res.body.images[3]._id).equal(3);
      done();
    });
  });
  it('first page should succeed', function (done) {
    var query = {
      gt: 6, ps: 4
    };
    expl.get('/api/images').query(query).end(function (err, res) {
      expect(err).not.exist;
      expect(res.body.err).not.exist;
      expect(res.body.gt).equal(0);
      expect(res.body.lt).equal(7);
      expect(res.body.images).length(4);
      expect(res.body.images[0]._id).equal(10);
      expect(res.body.images[3]._id).equal(7);
      done();
    });
  });
});
