var fs = require('fs');

var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config');
var fsp = require('../base/fs');
var utilp = require('../base/util');
var exp = require('../express/express');
var upload = require('../express/upload');
var userb = require('../user/user-base');
var imageb = require('../image/image-base');
var imagen = require('../image/image-new');
var site = require('../image/image-site');
var imageu = exports;

// get /api/images/:id([0-9]+)/update 업데이트 뷰 api 가 없지만 앱 만들기 전에는 필요가 없을 것 같다.

exp.core.get('/images/:id([0-9]+)/update', function (req, res, done) {
  userb.checkUser(res, function (err, user) {
    if (err) return done(err);
    var id = parseInt(req.params.id) || 0;
    imageu.checkUpdatable(id, user, function (err, image) {
      if (err) return done(err);
      res.render('image/image-update', {
        image: image
      });
    });
  });
});

exp.core.put('/api/images/:id([0-9]+)', upload.handler(function (req, res, done) {
  userb.checkUser(res, function (err, user) {
    if (err) return done(err);
    var id = parseInt(req.params.id) || 0;
    var form = imagen.getForm(req);
    imageu.checkUpdatable(id, user, function (err) {
      if (err) return done(err);
      utilp.fif(!form.files, function (next) {
        next({}, null, null);
      }, function (next) {
        var file = form.files[0];
        site.checkImageMeta(file.path, function (err, meta) {
          if (err) return done(err);
          var path = new imageb.FilePath(id, meta.format);
          fsp.removeDir(path.dir, function (err) {
            if (err) return done(err);
            fsp.makeDir(path.dir, function (err) {
              if (err) return done(err);
              fs.rename(file.path, path.original, function (err) {
                if (err) return done(err);
                site.makeVersions(path, meta, function (err, vers) {
                  if (err) return done(err);
                  var fields = {
                    fname: file.safeFilename,
                    format: meta.format,
                  }
                  next(fields, meta, vers);
                });
              });
            });
          });
        });
      }, function (fields, meta, vers) {
        site.fillFields(fields, form, meta, vers);
        imageb.images.updateOne({ _id: id }, { $set: fields }, function (err) {
          if (err) return done(err);
          res.json({});
          done();
        });
      });
    });
  });
}));

imageu.checkUpdatable = function (id, user, done) {
  imageb.images.findOne({ _id: id }, function (err, image) {
    if (err) return done(err);
    if (!image) {
      return done(error('IMAGE_NOT_EXIST'));
    }
    if (image.uid != user._id && !user.admin) {
      return done(error('NOT_AUTHORIZED'));
    }
    done(null, image);
  });
}
