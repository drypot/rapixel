var fs = require('fs');
var path = require('path');

var init = require('../base/init');
var config = require('../base/config');
var fsp = require('../base/fs');
var _multiparty = require('connect-multiparty');
var exp = require('../main/express');

var tmpDir;
var multiparty;

init.add(function (done) {
  console.log('upload: ' + config.uploadDir);
  multiparty = _multiparty({ uploadDir: config.uploadDir + '/tmp' });
  tmpDir = config.uploadDir + '/tmp',
  fsp.makeDirs(tmpDir, function (err) {
    if (err) return done(err);
    fsp.emptyDir(tmpDir, done);
  });

  if (config.development) {
    exp.core.get('/upload-test', function (req, res) {
      res.render('main/upload-test');
    });

    exp.core.post('/api/upload-test', exports.handler(function (req, res, done) {
      req.body.files = [];
      if (req.files) {
        req.files.files.forEach(function (file) {
          req.body.files.push(file.path);
        })
      }
      res.json(req.body);
      done();
    }));
  }
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


      // org fname size 0 인 경우는 어떻게 할까?
      var files = [];
      for (var key in req.files) {
        if (!Array.isArray(req.files[key])) {
          req.files[key] = [req.files[key]];
        }
        req.files[key].forEach(function (file) {
          paths.push(file.path);
          if (file.originalFilename.trim() /* && file.size */) {
            file.safeFilename = fsp.safeFilename(path.basename(file.originalFilename));
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
