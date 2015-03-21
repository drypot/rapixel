var fs = require('fs');

var init = require('../base/init');
var config = require('../base/config')({ parseArg: true });
var mongo = require('../mongo/mongo');
var imageb = require('../image/image-base');

init.run(function (err) {
  if (err) throw err;
  console.log('start.');
  var cursor = imageb.images.find();
  function read() {
    cursor.nextObject(function (err, image) {
      if (err) return done(err);
      if (!image) return done();
      var id = image._id;
      var dir = imageb.getImageDir(id);
      var oname = dir + '/' + id + '-org.' + image.format;    
      var nname = dir + '/' + id + '.' + image.format;
      //console.log(oname + ' -> ' + nname);
      fs.renameSync(oname, nname);
      setImmediate(read);
    });
  }
  function done() {
    console.log('done.');
    mongo.db.close();
  }
  read();
});
