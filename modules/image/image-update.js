var fs = require('fs');

var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config');
var fsp = require('../base/fs');
var exp = require('../main/express');
var upload = require('../upload/upload');
var usera = require('../user/user-auth');
var imageb = require('../image/image-base');
var imagec = require('../image/image-create');
var site = require('../image/image-site');

init.add(function () {
  exp.core.put('/api/images/:id([0-9]+)', function (req, res, done) {
    usera.identifyUser(res, function (err, user) {
      if (err) return done(err);
      var id = parseInt(req.params.id) || 0;
      var form = imagec.getForm(req.body);
      exports.checkUpdatable(id, user, function (err) {
        if (err) return done(err);
        exports.updateImage(id, form, function (err) {
          if (err) return done(err);
          res.json({});
        });
      });
    });
  });

  exp.core.get('/images/:id([0-9]+)/update', function (req, res, done) {
    usera.identifyUser(res, function (err, user) {
      if (err) return done(err);
      var id = parseInt(req.params.id) || 0;
      exports.checkUpdatable(id, user, function (err, image) {
        if (err) return done(err);
        res.render('image/image-update', {
          image: image
        });
      });
    });
  });
});

exports.checkUpdatable = function (id, user, done) {
  imageb.images.findOne({ _id: id }, function (err, image) {
    if (err) return done(err);
    if (!image) {
      return done(error(error.IMAGE_NOT_EXIST));
    }
    if (!user.admin && image.uid != user._id) {
      return done(error(error.NOT_AUTHORIZED));
    }
    done(null, image);
  });
}

exports.updateImage = function(id, form, _done) {
  var done = upload.deleter(form.files, _done);
  var file = form.files[0];
  if (file) {
    return site.checkImageMeta(file.tpath, function (err, meta) {
      if (err) return done(err);
      var dir = imageb.getImageDir(id);
      fsp.removeDirs(dir, function (err) {
        if (err) return done(err);
        fsp.makeDirs(dir, function (err) {
          if (err) return done(err);
          var org = imageb.getOriginalPath(dir, id, meta.format);
          fs.rename(file.tpath, org, function (err) {
            if (err) return done(err);
            site.makeVersions(org, meta, dir, id, function (err, vers) {
              if (err) return done(err);
              var fields = {
                fname: file.safeFilename,
                format: meta.format,
              }
              site.fillFields(fields, form, meta, vers);
              imageb.images.update({ _id: id }, { $set: fields }, done);
            });
          });
        });
      });
    });
  }
  var fields = {};
  site.fillFields(fields, form);
  imageb.images.update({ _id: id }, { $set: fields }, done);
};

exports.removeVersions = function (dir, done) {
  fs.readdir(dir, function (err, fnames) {
    if (err) return done(err);
    var i = 0;
    function unlink() {
      if (i == fnames.length) {
        return done();
      }
      var fname = fnames[i++];
      if (~fname.indexOf('org')) {
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
