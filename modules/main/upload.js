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

exports.handler = function (req, res, done) {
  if (req.query.rtype === 'html') {
    usera.getUser(res, function (err, user) {
      if (err) return res.send(JSON.stringify(err));
      res.send(JSON.stringify(saveTmpFiles(req)));
    });
  } else {
    usera.getUser(res, function (err, user) {
      if (err) return res.jsonErr(err);
      res.json(saveTmpFiles(req));
    });
  }
};

function saveTmpFiles(req) {
  var files = {};

  // sample req.files
  //
  // { files: [ 
  //   { 
  //     fieldName: 'files',
  //     originalFilename: 'f1.txt',
  //     path: 'upload/rapixel-test/tmp/36597-czuain.txt',
  //     headers: [Object],
  //     ws: [Object],
  //     size: 6,
  //     name: 'f1.txt',
  //     type: 'text/plain' 
  //   },
  //   { fieldName: 'files',
  //     originalFilename: 'f2.txt',
  //     path: 'upload/rapixel-test/tmp/36597-bl6rgv.txt',
  //     headers: [Object],
  //     ws: [Object],
  //     size: 6,
  //     name: 'f2.txt',
  //     type: 'text/plain' 
  //   } 
  // ]}

  for (var key in req.files) {
    var rfiles = req.files[key];
    if (!Array.isArray(rfiles)) {
      rfiles = [rfiles];
    }
    for (var i = 0; i < rfiles.length; i++) {
      var rfile = rfiles[i];
      if (/*rfile.size &&*/ rfile.name) {
        if (!files[key]) {
          files[key] = [];
        }
        files[key].push({
          oname: rfile.name,
          tname: path.basename(rfile.path)
        });
      }
    }
  }
  
  //   sample return object.
  //
  //   { files: [ 
  //       { oname: 'f1.txt', tname: '36597-czuain.txt' },
  //       { oname: 'f2.txt', tname: '36597-bl6rgv.txt' } 
  //   ]}
  
  return files;
};

var getTmpPath = exports.getTmpPath = function (tname) {
  return tmpDir + '/' + tname;
}

exports.normalizeFilenames = function (files) {
  files = files || [];
  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    file.oname = fs2.safeFilename(path.basename(file.oname));
    file.tname = path.basename(file.tname);
    file.tpath = getTmpPath(file.tname);
  }
  return files;
};

exports.deleter = function (files, done) {
  return function () {
    var _arg = arguments;
    if (!files) {
      return done.apply(null, _arg);
    }
    var i = 0;
    function unlink() {
      if (i == files.length) {
        return done.apply(null, _arg);
      }
      var file = files[i++];
      fs.unlink(file.tpath, function (err) {
        setImmediate(unlink);
      });
    }
    unlink();
  };
};
