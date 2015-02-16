var fs = require('fs');

var init = require('../lang/init');
var error = require('../error/error');
var config = require('../config/config');
var fs2 = require('../fs/fs');
var express = require('../express/express');
var upload = require('../upload/upload');
var usera = require('../user/user-auth');
var imageb = require('../image/image-base');
var imagec = require('../image/image-create');
var site = require('../image/image-site');

init.add(function () {
  var app = express.app;

  app.put('/api/images/:id([0-9]+)', function (req, res) {
    usera.getUser(res, function (err, user) {
      if (err) return res.jsonErr(err);
      var id = parseInt(req.params.id) || 0;
      var form = imagec.getForm(req.body);
      exports.checkUpdatable(id, user, function (err) {
        if (err) return res.jsonErr(err);
        exports.updateImage(id, form, function (err) {
          if (err) return res.jsonErr(err);
          res.json({});
        });
      });
    });
  });

  app.get('/images/:id([0-9]+)/update', function (req, res) {
    usera.getUser(res, function (err, user) {
      if (err) return res.renderErr(err);
      var id = parseInt(req.params.id) || 0;
      exports.checkUpdatable(id, user, function (err, image) {
        if (err) return res.renderErr(err);
        res.render('image/image-update', {
          image: image
        });
      });
    });
  });
});

exports.checkUpdatable = function (id, user, next) {
  imageb.images.findOne({ _id: id }, function (err, image) {
    if (err) return next(err);
    if (!image) {
      return next(error(error.IMAGE_NOT_EXIST));
    }
    if (!user.admin && image.uid != user._id) {
      return next(error(error.NOT_AUTHORIZED));
    }
    next(null, image);
  });
}

exports.updateImage = function(id, form, _next) {
  var next = upload.deleter(form.files, _next);
  var file = form.files[0];
  if (file) {
    return site.checkImageMeta(file.tpath, function (err, meta) {
      if (err) return next(err);
      var dir = imageb.getImageDir(id);
      fs2.removeDirs(dir, function (err) {
        if (err) return next(err);
        fs2.makeDirs(dir, function (err) {
          if (err) return next(err);
          var org = imageb.getOriginalPath(dir, id, meta.format);
          fs.rename(file.tpath, org, function (err) {
            if (err) return next(err);
            site.makeVersions(org, meta, dir, id, function (err, vers) {
              if (err) return next(err);
              var fields = {
                fname: file.oname,
                format: meta.format,
              }
              site.fillFields(fields, form, meta, vers);
              imageb.images.update({ _id: id }, { $set: fields }, next);
            });
          });
        });
      });
    });
  }
  var fields = {};
  site.fillFields(fields, form);
  imageb.images.update({ _id: id }, { $set: fields }, next);
};

exports.removeVersions = function (dir, next) {
  fs.readdir(dir, function (err, fnames) {
    if (err) return next(err);
    var i = 0;
    function unlink() {
      if (i == fnames.length) {
        return next();
      }
      var fname = fnames[i++];
      if (~fname.indexOf('org')) {
        //console.log('preserve ' + dir + '/' + fname);
        setImmediate(unlink);
      } else {
        //console.log('delete ' + dir + '/' + fname);
        fs.unlink(dir + '/' + fname, function (err) {
          if (err && err.code !== 'ENOENT') return next(err);
          setImmediate(unlink);
        });
      }
    }
    unlink();
  });
};
