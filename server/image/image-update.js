var fs = require('fs');

var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config');
var fs2 = require('../base/fs2');
var util2 = require('../base/util2');
var expb = require('../express/express-base');
var expu = require('../express/express-upload');
var userb = require('../user/user-base');
var usera = require('../user/user-auth');
var imageb = require('../image/image-base');
var imagen = require('../image/image-new');
var site = require('../image/image-site');
var imageu = exports;

// get /api/images/:id([0-9]+)/update 업데이트 뷰 api 가 없지만 앱 만들기 전에는 필요가 없을 것 같다.

expb.core.get('/images/:id([0-9]+)/update', function (req, res, done) {
  usera.checkUser(res, function (err, user) {
    if (err) return done(err);
    var id = parseInt(req.params.id) || 0;
    imageu.checkUpdatable(user, id, function (err, image) {
      if (err) return done(err);
      res.render('image/image-update', {
        image: image
      });
    });
  });
});

expb.core.put('/api/images/:id([0-9]+)', expu.handler(function (req, res, done) {
  usera.checkUser(res, function (err, user) {
    if (err) return done(err);
    var id = parseInt(req.params.id) || 0;
    var form = imagen.getForm(req);
    imageu.checkUpdatable(user, id, function (err) {
      if (err) return done(err);
      util2.fif(!form.files, function (next) {
        next({}, null, null);
      }, function (next) {
        var file = form.files[0];
        site.checkImageMeta(file.path, function (err, meta) {
          if (err) return done(err);
          var path = new imageb.Image(id, meta.format);
          fs2.removeDir(path.dir, function (err) {
            if (err) return done(err);
            fs2.makeDir(path.dir, function (err) {
              if (err) return done(err);
              fs.rename(file.path, path.original, function (err) {
                if (err) return done(err);
                site.saveImage(path, meta, function (err, vers) {
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
        site.fillImageDoc(fields, form, meta, vers);
        imageb.images.updateOne({ _id: id }, { $set: fields }, function (err) {
          if (err) return done(err);
          res.json({});
          done();
        });
      });
    });
  });
}));

imageu.checkUpdatable = function (user, id, done) {
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
