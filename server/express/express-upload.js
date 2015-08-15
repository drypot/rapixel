var fs = require('fs');
var path = require('path');

var init = require('../base/init');
var config = require('../base/config');
var fs2 = require('../base/fs2');
var multiparty = require('multiparty');
var expb = require('../express/express-base');
var expu = exports;

var tmpDir;

init.add(function (done) {
  console.log('upload: ' + config.uploadDir);
  tmpDir = config.uploadDir + '/tmp';
  fs2.makeDir(tmpDir, function (err) {
    if (err) return done(err);
    fs2.emptyDir(tmpDir, done);
  });

  if (config.dev) {
    expb.core.get('/test/upload', function (req, res) {
      res.render('express/express-upload');
    });

    expb.core.all('/api/test/echo-upload', expu.handler(function (req, res, done) {
      var paths = [];
      if (req.files) {
        Object.keys(req.files).forEach(function (field) {
          req.files[field].forEach(function (file) {
            paths.push(file.originalFilename);
          });
        });
      }
      res.json({
        method: req.method,
        rtype: req.header('content-type'),
        query: req.query,
        body: req.body,
        files: paths
      });
      done();
    }));
  }
});

// req.files is undefined or 
//
// { 
//   f1: [ {   <-- input field name
//     fieldName: 'f1',
//     originalFilename: 'express-upload-f1.txt',
//     path: 'upload/rapixel-test/tmp/L-QT_2veCOSuKmOjdsFu3ivR.txt',
//      'content-disposition': 'form-data; name="f1"; filename="upload-f1.txt"',
//      'content-type': 'text/plain' 
//     size: 6,
//     safeFilename: 'express-upload-f1.txt' 
//   }, {
//     ...
//   },
//     ... 
//   ] 
// }

expu.handler = function (inner) {
  return function (req, res, done) {
    if (req._body) return inner(req, res, done);
    var form = new multiparty.Form({ uploadDir: tmpDir });
    var paths = [];
    form.parse(req, function(err, fields, files) {
      var key, val;
      for (key in fields) {
        val = fields[key];
        req.body[key] = val.length == 1 ? val[0] : val;
      }
      for (key in files) {
        files[key].forEach(function (file) {
          paths.push(file.path);
          if (file.originalFilename.trim()) {
            // XHR 이 빈 파일 필드를 보낸다.
            // 불필요한 req.files[key] 생성을 막기 위해 조건 처리는 가장 안쪽에서.
            if (!req.files) req.files = {};
            if (!req.files[key]) req.files[key] = [];
            file.safeFilename = fs2.safeFilename(path.basename(file.originalFilename));
            req.files[key].push(file);
          }
        });
      }      
      inner(req, res, deleter);
    });

    function deleter(err) {
      var i = 0;
      function unlink() {
        if (i == paths.length) {
          if (err) done(err);
          return;
        }
        var path = paths[i++];
        fs.unlink(path, function (err) {
          setImmediate(unlink);
        });
      }
      unlink();
    }
  };
};
