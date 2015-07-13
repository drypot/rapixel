var init = require('../base/init');
var config = require('../base/config');
var mongop = require('../mongo/mongo');
var userb = require('../user/user-base');

init.run(function (err) {
  mongop.forEach(userb.users, function (user, done) {
    if (!user.namel) {
      process.stdout.write(user._id + 'u ');
      var fields = {};
      if (!user.home) {
        user.home = user.name;
        fields.home = user.home;
      }
      fields.namel = user.name.toLowerCase();
      fields.homel = user.home.toLowerCase();
      return userb.users.updateOne({ _id: user._id }, { $set: fields }, done);
    }
    process.stdout.write(user._id + 's ');
    done();
  }, function (err) {
    if (err) throw err;
    console.log('done');
    mongop.db.close();
  });
});