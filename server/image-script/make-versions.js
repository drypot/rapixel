var fs = require('fs');

var init = require('../base/init');
var config = require('../base/config')({ parseArg: true });
var mongob = require('../mongo/mongo-base');
var imageb = require('../image/image-base');

// TODO: 만든지 오래되었다. 누더기 상태. 다시 만들어야한다.
//       image-update.js, rename-org.js 참고.

init.add(function (done) {
  console.log('start rendering.');

  var cursor = imageb.images.find();
  function read() {
    cursor.nextObject(function (err, image) {
      if (err) return done(err);
      if (image) {
        var id = image._id;
        var path = new imageb.FilePath(id, image.format);
        removeVersions(path.dir, function (err) {
          if (err) return done(err);
          process.stdout.write(id + ' ');
          imageb.makeVersions(id, path.dir, org.org, image.width, function (err, vers) {
            if (err) return done(err);
            var fields = {
              $set : { vers: vers }
            }
            imageb.images.updateOne({ _id: id }, fields, function (err) {
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

// image-update 에서 옮겨옴. 여기서 밖에 안 쓴다.
function removeVersions(dir, done) {
  fs.readdir(dir, function (err, fnames) {
    if (err) return done(err);
    var i = 0;
    function unlink() {
      if (i == fnames.length) {
        return done();
      }
      var fname = fnames[i++];
      if (~fname.indexOf('org')) { // <-- 이제 원본에 org 를 넣지 않는다.
        //console.log('preserve ' + dir + '/' + fname);
        setImmediate(unlink);
      } else {
        //console.log('delete ' + dir + '/' + fname);
        fs.unlink(dir + '/' + fname, function (err) {
          if (err && err.code !== 'ENOENT') return done(err);
          setImmediate(unlink);
        });
      }
    }
    unlink();
  });
};

init.run(function (err) {
  if (err) throw err;
  mongob.db.close();
});
