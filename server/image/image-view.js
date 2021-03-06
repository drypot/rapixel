var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config');
var util2 = require('../base/util2');
var expb = require('../express/express-base');
var expu = require('../express/express-upload');
var userb = require('../user/user-base');
var imageb = require('../image/image-base');
var site = require('../image/image-site');

expb.core.get('/api/images/:id([0-9]+)', function (req, res, done) {
  view(req, res, true, done);
});

expb.core.get('/images/:id([0-9]+)', function (req, res, done) {
  view(req, res, false, done);
});

function view(req, res, api, done) {
  var id = parseInt(req.params.id) || 0;
  util2.fif(!api || req.query.hasOwnProperty('hit'), function (next) {
    imageb.images.updateOne({ _id: id }, { $inc: { hit: 1 }}, next);
  }, function (err) {
    if (err) return done(err);
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
        image.dir = imageb.getDirUrl(image._id);
        image.cdateStr = util2.dateTimeString(image.cdate);
        image.cdate = image.cdate.getTime();
        if (api) {
          res.json(image);
        } else {
          var cuser = res.locals.user;
          res.render('image/image-view', {
            image: image,
            svg: site.svg,
            updatable: cuser && (image.user._id == cuser._id || cuser.admin),
            imageView: true
          });
        }
      });
    });
  });
}

expb.core.get('/photos/:id([0-9]+)', function (req, res, done) {
  res.redirect('/images/' + req.params.id);
});

expb.core.get('/drawings/:id([0-9]+)', function (req, res, done) {
  res.redirect('/images/' + req.params.id);
});
