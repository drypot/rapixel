var fs = require('fs');

var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config');
var fsp = require('../base/fs');
var exp = require('../main/express');
var upload = require('../upload/upload');
var usera = require('../user/user-auth');
var imageb = require('../image/image-base');
var imageu = require('../image/image-update');

init.add(function () {
  exp.core.delete('/api/images/:id([0-9]+)', function (req, res, done) {
    usera.identifyUser(res, function (err, user) {
      if (err) return done(err);
      var id = parseInt(req.params.id) || 0;
      imageu.checkUpdatable(id, user, function (err) {
        if (err) return done(err);
        delImage(id, function (err) {
          if (err) return done(err);
          res.json({});
        });
      });
    });
  });
});

function delImage(id, done) {
  imageb.images.remove({ _id: id }, function (err, cnt) {
    if (err) return done(err);
    fsp.removeDirs(imageb.getImageDir(id), function (err) {
      if (err) return done(err);
      done();
    });
  });
};

