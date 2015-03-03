var init = require('../lang/init');
var error = require('../error/error');
var config = require('../config/config');
var dt = require('../lang/dt');
var express = require('../express/express');
var upload = require('../upload/upload');
var userv = require('../user/user-view');
var imageb = require('../image/image-base');
var site = require('../image/image-site');

init.add(function () {
  var app = express.app;

  app.get('/api/images/:id([0-9]+)', function (req, res) {
    var id = parseInt(req.params.id) || 0;
    incHit(id, req.query.hasOwnProperty('hit'), function (err) {
      if (err) return res.jsonErr(err);
      findImage(id, function (err, image) {
        if (err) return res.jsonErr(err);
        res.json(image);
      });
    });
  });

  app.get('/images/:id([0-9]+)', function (req, res) {
    var id = parseInt(req.params.id) || 0;
    incHit(id, true, function (err) {
      if (err) return res.jsonErr(err);
      findImage(id, function (err, image) {
        if (err) return res.renderErr(err);
        var user = res.locals.user;
        res.render('image/image-view', {
          image: image,
          svg: site.svg,
          updatable: user && (image.user._id == user._id || user.admin),
          imageView: true
        });
      });
    });
  });

  app.get('/photos/:id([0-9]+)', function (req, res) {
    res.redirect('/images/' + req.params.id);
  });

  app.get('/drawings/:id([0-9]+)', function (req, res) {
    res.redirect('/images/' + req.params.id);
  });
});

function incHit(id, hit, done) {
  if (!hit) return done();
  imageb.images.update({ _id: id }, { $inc: { hit: 1 }}, done);
}

function findImage(id, done) {
  imageb.images.findOne({ _id: id }, function (err, image) {
    if (err) return done(err);
    if (!image) return done(error(error.IMAGE_NOT_EXIST));
    userv.getCached(image.uid, function (err, user) {
      if (err) return done(err);
      image.user = {
        _id: user._id,
        name: user.name,
        home: user.home
      };
      image.dir = imageb.getImageUrl(image._id);
      image.cdateStr = dt.format(image.cdate);
      image.cdate = image.cdate.getTime();
      done(null, image);
    });
  });
};

