var fs = require('fs');

var init = require('../base/init');
var error = require('../error/error');
var config = require('../config/config');
var fs2 = require('../fs/fs');
var express = require('../express/express');
var upload = require('../upload/upload');
var usera = require('../user/user-auth');
var imageb = require('../image/image-base');
var imageu = require('../image/image-update');

init.add(function () {
  var app = express.app;

  app.delete('/api/images/:id([0-9]+)', function (req, res) {
    usera.getUser(res, function (err, user) {
      if (err) return res.jsonErr(err);
      var id = parseInt(req.params.id) || 0;
      imageu.checkUpdatable(id, user, function (err) {
        if (err) return res.jsonErr(err);
        delImage(id, function (err) {
          if (err) return res.jsonErr(err);
          res.json({});
        });
      });
    });
  });
});

function delImage(id, done) {
  imageb.images.remove({ _id: id }, function (err, cnt) {
    if (err) return done(err);
    fs2.removeDirs(imageb.getImageDir(id), function (err) {
      if (err) return done(err);
      done();
    });
  });
};

