var init = require('../base/init');
var config = require('../base/config');
var mongob = require('../mongo/mongo-base');
var imageb = require('../image/image-base');

init.run(function (err) {
  var col = imageb.images
  mongob.forEach(col, function (obj, done) {
    if (obj.comment == undefined) {
      process.stdout.write(obj._id + 'u ');
      var fields = {};
      fields.comment = '';
      return col.updateOne({ _id: obj._id }, { $set: fields }, done);
    }
    process.stdout.write(obj._id + 's ');
    done();
  }, function (err) {
    if (err) throw err;
    console.log('done');
    mongob.db.close();
  });
});
