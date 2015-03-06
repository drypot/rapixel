var fs = require('fs');

var init = require('../base/init');
var config = require('../config/config')({ parseArg: true });
var mongo = require('../mongo/mongo');
var imageb = require('../image/image-base');
var imagel = require('../image/image');

// TODO: SHOULD BE UPDATED

init.add(function (done) {
  console.log('start rendering.');

  var cursor = imageb.images.find();
  function read() {
    cursor.nextObject(function (err, image) {
      if (err) return done(err);
      if (image) {
        var id = image._id;
        var dir = imagel.getImageDir(id);
        imagel.removeVersions(dir, function (err) {
          if (err) return done(err);
          var org = imagel.getOriginalPath(dir, id, image.format);
          process.stdout.write(id + ' ');
          imagel.makeVersions(id, dir, org, image.width, function (err, vers) {
            if (err) return done(err);
            var fields = {
              $set : { vers: vers }
            }
            imageb.images.update({ _id: id }, fields, function (err) {
              if (err) return done(err);
              setImmediate(read);
            });
          });
        });
        return;
      }
      console.log('done.');
      done();
    });
  }
  read();
});

init.run(function (err) {
  if (err) throw err;
  mongo.db.close();
});
