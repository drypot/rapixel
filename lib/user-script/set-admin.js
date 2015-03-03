var init = require('../lang/init');
var config = require('../config/config');
var mongo = require('../mongo/mongo');
var userb = require('../user/userb');

init.add(function (done) {
  if (config.argv.length < 2) {
    console.log('\nspecify email.');
    return done();
  }
  userb.users.update({ email: config.argv[1] }, { $set: { admin: true } }, done);
});

init.run(function (err) {
  mongo.db.close();
  if (err) throw err;
});
