var fs = require('fs');

var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config');
var fsp = require('../base/fs');
var exp = require('../express/express');
var upload = require('../express/upload');
var userb = require('../user/user-base');
var imageb = require('../image/image-base');
var imagec = require('../image/image-create');
var site = require('../image/image-site');
var imageu = exports;

exp.core.put('/api/images/:id([0-9]+)', upload.handler(function (req, res, done) {
  userb.checkUser(res, function (err, user) {
    if (err) return done(err);
    var id = parseInt(req.params.id) || 0;
    var form = imagec.getForm(req);
    imageu.checkUpdatable(id, user, function (err) {
      if (err) return done(err);
      updateImage(id, form, function (err) {
        if (err) return done(err);
        res.json({});
        done();
      });
    });
  });
}));

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

imageu.checkUpdatable = function (id, user, done) {
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

function updateImage(id, form, done) {
  var file = form.files[0];
  if (!file) {
    var fields = {};
    site.fillFields(fields, form);
    imageb.images.update({ _id: id }, { $set: fields }, done);
    return;
  } 
  site.checkImageMeta(file.path, function (err, meta) {
    if (err) return done(err);
    var dir = new imageb.ImagePath(id, meta.format);
    fsp.removeDirs(dir.dir, function (err) {
      if (err) return done(err);
      fsp.makeDirs(dir.dir, function (err) {
        if (err) return done(err);
        fs.rename(file.path, dir.original, function (err) {
          if (err) return done(err);
          site.makeVersions(dir, meta, function (err, vers) {
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
};
