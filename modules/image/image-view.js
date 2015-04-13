var init = require('../base/init');
var utilp = require('../base/util');
var error = require('../base/error');
var config = require('../base/config');
var exp = require('../express/express');
var upload = require('../express/upload');
var userb = require('../user/user-base');
var imageb = require('../image/image-base');
var site = require('../image/image-site');

exp.core.get('/api/images/:id([0-9]+)', function (req, res, done) {
  var id = parseInt(req.params.id) || 0;
  incHit(id, req.query.hasOwnProperty('hit'), function (err) {
    if (err) return done(err);
    findImage(id, function (err, image) {
      if (err) return done(err);
      res.json(image);
    });
  });
});

exp.core.get('/images/:id([0-9]+)', function (req, res, done) {
  var id = parseInt(req.params.id) || 0;
  incHit(id, true, function (err) {
    if (err) return done(err);
    findImage(id, function (err, image) {
      if (err) return done(err);
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

function incHit(id, hit, done) {
  if (!hit) return done();
  imageb.images.updateOne({ _id: id }, { $inc: { hit: 1 }}, done);
}

function findImage(id, done) {
  imageb.images.findOne({ _id: id }, function (err, image) {
    if (err) return done(err);
    if (!image) return done(error('IMAGE_NOT_EXIST'));
    userb.getCached(image.uid, function (err, user) {
      if (err) return done(err);
      image.user = {
        _id: user._id,
        name: user.name,
        home: user.home
      };
      image.dir = imageb.getUrlBase(image._id);
      image.cdateStr = utilp.toDateTimeString(image.cdate);
      image.cdate = image.cdate.getTime();
      done(null, image);
    });
  });
};

exp.core.get('/photos/:id([0-9]+)', function (req, res, done) {
  res.redirect('/images/' + req.params.id);
});

exp.core.get('/drawings/:id([0-9]+)', function (req, res, done) {
  res.redirect('/images/' + req.params.id);
});
