var init = require('../base/init');
var config = require('../base/config');
var mongob = require('../mongo/mongo-base');

init.add(function (done) {
  if (config.argv.length < 2) {
    console.log('\nspecify email.');
    return done();
  }
  mongob.db.collection('users').updateOne({ email: config.argv[1] }, { $set: { admin: true } }, done);
});

init.run(function (err) {
  mongob.db.close();
  if (err) throw err;
});
