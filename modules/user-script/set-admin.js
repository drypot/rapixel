var init = require('../base/init');
var config = require('../base/config');
var mongop = require('../mongo/mongo');
var userb = require('../user/userb');

init.add(function (done) {
  if (config.argv.length < 2) {
    console.log('\nspecify email.');
    return done();
  }
  userb.users.updateOne({ email: config.argv[1] }, { $set: { admin: true } }, done);
});

init.run(function (err) {
  mongop.db.close();
  if (err) throw err;
});
