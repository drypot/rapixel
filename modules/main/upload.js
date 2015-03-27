var fs = require('fs');
var path = require('path');

var init = require('../base/init');
var config = require('../base/config');
var fsp = require('../base/fs');
var multiparty = require('multiparty');
var exp = require('../main/express');

var tmpDir;

init.add(function (done) {
  console.log('upload: ' + config.uploadDir);
  tmpDir = config.uploadDir + '/tmp';
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
    if (req._body) return inner(req, res, done);

    var form = new multiparty.Form({ uploadDir: tmpDir });
    var paths = [];

    form.parse(req, function(err, fields, files) {
      var key, val;

      for (key in fields) {
        val = fields[key];
        req.body[key] = val.length == 1 ? val[0] : val;
      }

      // sample files.f1[0]
      //
      // { 
      //   fieldName: 'f1',
      //   originalFilename: 'upload-fixture1.txt',
      //   path: 'upload/rapixel-test/tmp/EGr-pRnhF0q6hrnSSxNfJiZC.txt',
      //   headers: { 
      //     'content-disposition': 'form-data; name="f1"; filename="upload-fixture1.txt"',
      //     'content-type': 'text/plain' 
      //   },
      //   size: 6 
      // }

      req.files = {};
      for (key in files) {
        req.files[key] = [];
        files[key].forEach(function (file) {
          paths.push(file.path);
          if (file.originalFilename.trim()) {
            file.safeFilename = fsp.safeFilename(path.basename(file.originalFilename));
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
        //console.log("deleting: " + path);
        fs.unlink(path, function (err) {
          setImmediate(unlink);
        });
      }
      unlink();
    }
  };
};
