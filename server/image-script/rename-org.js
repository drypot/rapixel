var fs = require('fs');

var init = require('../base/init');
var config = require('../base/config')({ parseArg: true });
var mongob = require('../mongo/mongo-base');
var imageb = require('../image/image-base');

init.run(function (err) {
  if (err) throw err;
  console.log('start.');
  var cursor = imageb.images.find();
  function read() {
    cursor.nextObject(function (err, image) {
      if (err) return done(err);
      if (!image) return done();
      var dir = new imageb.FilePath(image._id, image.format).dir;
      var oname = dir + '/' + image._id + '.' + image.format;    
      var nname = dir + '/' + image._id + '-org.' + image.format;
      //console.log(oname + ' -> ' + nname);
      fs.renameSync(oname, nname);
      setImmediate(read);
    });
  }
  function done() {
    console.log('done.');
    mongob.db.close();
  }
  read();
});
