var fs = require('fs');
var path = require('path');

exports.makeDirs = function () {
  var done = arguments[arguments.length - 1];
  var subs = arguments;
  var p = null;
  var i = 0;
  function mkdir() {
    if (i == subs.length - 1) {
      return done(null, p);
    }
    var sub = subs[i++];
    if (Array.isArray(sub)) {
      return makeDirsArray(p, sub, function (err, _path) {
        if (err) return done(err);
        p = _path;
        setImmediate(mkdir);
      });
    }
    p = !p ? sub : p + '/' + sub;
    makeDirsString(p, function (err) {
      if (err) return done(err);
      setImmediate(mkdir);
    });
  }
  mkdir();
};

function makeDirsArray(p, ary, done) {
  var i = 0;
  function mkdir() {
    if (i == ary.length) {
      return done(null, p);
    }
    var sub = ary[i++];
    p = !p ? sub : p + '/' + sub;
    fs.mkdir(p, 0755, function (err) {
      if (err && err.code !== 'EEXIST') return done(err);
      setImmediate(mkdir);
    });
  }
  mkdir();
}

function makeDirsString(p, done) {
  fs.mkdir(p, 0755, function(err) {
    if (err && err.code === 'ENOENT') {
      return makeDirsString(path.dirname(p), function (err) {
        if (err) return done(err);
        fs.mkdir(p, 0755, function(err) {
          if (err && err.code !== 'EEXIST') return done(err);
          done();
        });
      });
    }
    if (err && err.code !== 'EEXIST') {
      return done(err);
    }
    done();
  });
}

exports.removeDirs = function removeDirs(p, done) {
  fs.stat(p, function (err, stat) {
    if (err) return done(err);
    if(stat.isFile()) {
      return fs.unlink(p, function (err) {
        if (err && err.code !== 'ENOENT') return done(err);
        done();
      });
    }
    if(stat.isDirectory()) {
      fs.readdir(p, function (err, fnames) {
        if (err) return done(err);
        var i = 0;
        function unlink() {
          if (i == fnames.length) {
            return fs.rmdir(p, function (err) {
              if (err && err.code !== 'ENOENT') return done(err);
              done();
            });
          }
          var fname = fnames[i++];
          removeDirs(p + '/' + fname, function (err) {
            if (err) return done(err);
            setImmediate(unlink);
          });
        }
        unlink();
      });
    }
  });
};

exports.emptyDir = function (p, done) {
  fs.readdir(p, function (err, fnames) {
    if (err) return done(err);
    var i = 0;
    function unlink() {
      if (i == fnames.length) {
        return done();
      }
      var fname = fnames[i++];
      exports.removeDirs(p + '/' + fname, function (err) {
        setImmediate(unlink);
      });
    }
    unlink();
  });
};

exports.safeFilename = function (name) {
  var i = 0;
  var len = name.length;
  var safe = '';
  for (; i < len; i++) {
    var ch = name.charAt(i);
    var code = name.charCodeAt(i);
    if ((ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z') || (ch >= '0' && ch <= '9') || "`~!@#$%^&()-_+=[{]};',. ".indexOf(ch) >= 0)
      safe += ch;
    else if (code < 128)
      safe += '_';
    else
      safe += ch;
  }
  return safe;
};

exports.makeDeepPath = function (id, iter) {
  var path = '';
  for (iter--; iter > 0; iter--) {
    path = '/' + id % 1000 + path;
    id = Math.floor(id / 1000);
  }
  return id + path;
}
