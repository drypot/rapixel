var init = require('../base/init');
var utilp = require('../base/util');
var error = require('../base/error');
var mongop = require('../mongo/mongo');
var exp = require('../express/express');
var userb = require('../user/user-base');
var imageb = require('../image/image-base');
var imagel = require('../image/image-list');
var site = require('../image/image-site');

exp.core.get('/users/:id([0-9]+)', function (req, res, done) {
  var id = parseInt(req.params.id) || 0;
  userb.getCached(id, function (err, tuser) {
    if (err) return done(err);
    profile(req, res, tuser);
  });
});

exp.core.get('/:name([^/]+)', function (req, res, done) {
  var homel = decodeURIComponent(req.params.name).toLowerCase();
  userb.getCachedByHome(homel, function (err, user) {
    if (err) return done(err);
    if (!user) return done();
    profile(req, res, user);
  });
});

function profile(req, res, tuser) {
  var user = res.locals.user;
  var lt = parseInt(req.query.lt) || 0;
  var gt = lt ? 0 : parseInt(req.query.gt) || 0;
  var ps = parseInt(req.query.ps) || 16;
  var query = { uid: tuser.id };
  mongop.findPage(imageb.images, { uid: tuser._id }, gt, lt, ps, filter, function (err, images, gt, lt) {
    if (err) return done(err);
    res.render('user-profile/user-profile', {
      tuser: tuser,
      updatable: user && (user._id === tuser._id || user.admin),
      images: images,
      suffix: site.thumbnailSuffix,
      gt: gt ? new utilp.UrlMaker(req.path).add('gt', gt).add('ps', ps, 16).done() : undefined,
      lt: lt ? new utilp.UrlMaker(req.path).add('lt', lt).add('ps', ps, 16).done() : undefined
    });
  });
}

function filter(image, done) {
  userb.getCached(image.uid, function (err, user) {
    if (err) return done(err);
    image.user = {
      _id: user._id,
      name: user.name,
      home: user.home
    };
    image.dir = imageb.getUrlBase(image._id);
    image.cdateStr = utilp.toDateTimeString(image.cdate);
    done(null, image);
  });
}
