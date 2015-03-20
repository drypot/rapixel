var fs = require('fs');
var path = require('path');

var init = require('../base/init');
var config = require('../base/config');
var fs2 = require('../base/fs');
var _multiparty = require('connect-multiparty');
var express2 = require('../main/express');

var tmpDir;
var multiparty;

init.add(function (done) {
  console.log('upload: ' + config.uploadDir);
  multiparty = _multiparty({ uploadDir: config.uploadDir + '/tmp' });
  tmpDir = config.uploadDir + '/tmp',
  fs2.makeDirs(tmpDir, function (err) {
    if (err) return done(err);
    fs2.emptyDir(tmpDir, done);
  });
});

exports.handler = function (inner) {
  return function (req, res, done) {

    var paths = [];

    multiparty(req, res, normalizeFiles);
    
    function normalizeFiles(err) {
      if (err) return done(err);

      // sample req.files
      //
      // { files: [ 
      //   { 
      //     fieldName: 'files',
      //     originalFilename: 'f1.txt',
      //     path: 'upload/tmp/36597-czuain.txt',
      //     headers: [Object],
      //     ws: [Object],
      //     size: 6,
      //     name: 'f1.txt',
      //     type: 'text/plain' 
      //   },
      //   {
      //     ...
      //   } 
      // ]}

      for (var key in req.files) {
        if (!Array.isArray(req.files[key])) {
          req.files[key] = [req.files[key]];
        }
        req.files[key].forEach(function (file) {
          paths.push(file.path);
          if (file.originalFilename.trim() /* && file.size */) {
            file.safeFilename = fs2.safeFilename(path.basename(file.originalFilename));
          } else {
            file.safeFilename = path.basename(file.path);
          }
        });
      }      
      inner(req, res, deleter);
    }

    function deleter(err) {
      var i = 0;
      function unlink() {
        if (i == paths.length) {
          if (err) done(err);
          return;
        }
        var path = paths[i++];
        //console.log("deleting: " + path);
        fs.unlink(path, function (err) {
          setImmediate(unlink);
        });
      }
      unlink();
    }
  };
};
