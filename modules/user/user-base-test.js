var should = require('should');

var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config')({ path: 'config/rapixel-test.json' });
var mongo = require('../mongo/mongo')({ dropDatabase: true });
var userb = require('../user/user-base');

before(function (done) {
  init.run(done);
});

describe("newId", function () {
  it("should success", function () {
    var id1 = userb.newId();
    var id1 = userb.newId();
    var id2 = userb.newId();
    var id2 = userb.newId();
    (id1 < id2).should.true;
  });
});