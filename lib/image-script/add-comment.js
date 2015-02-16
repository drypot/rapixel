var init = require('../lang/init');
var config = require('../config/config');
var mongo = require('../mongo/mongo');
var imageb = require('../image/image-base');

init.run(function (err) {
  var col = imageb.images
  mongo.forEach(col, function (obj, next) {
    if (obj.comment == undefined) {
      process.stdout.write(obj._id + 'u ');
      var fields = {};
      fields.comment = '';
      return col.update({ _id: obj._id }, { $set: fields }, next);
    }
    process.stdout.write(obj._id + 's ');
    next();
  }, function (err) {
    if (err) throw err;
    console.log('done');
    mongo.db.close();
  });
});
