var init = require('../base/init');
var util2 = require('../base/util2');
var error = require('../base/error');
var mongob = require('../mongo/mongo-base');
var expb = require('../express/express-base');
var userb = require('../user/user-base');
var imageb = require('../image/image-base');
var imagel = require('../image/image-list');
var site = require('../image/image-site');

expb.core.get('/users/:id([0-9]+)', function (req, res, done) {
  var id = parseInt(req.params.id) || 0;
  userb.getCached(id, function (err, tuser) {
    if (err) return done(err);
    list(req, res, tuser);
  });
});

expb.core.get('/:name([^/]+)', function (req, res, done) {
  var homel = decodeURIComponent(req.params.name).toLowerCase();
  userb.getCachedByHome(homel, function (err, tuser) {
    if (err) return done(err);
    if (!tuser) return done();
    list(req, res, tuser);
  });
});

function list(req, res, tuser) {
  var user = res.locals.user;
  var lt = parseInt(req.query.lt) || 0;
  var gt = lt ? 0 : parseInt(req.query.gt) || 0;
  var ps = parseInt(req.query.ps) || 16;
  var query = { uid: tuser.id };
  mongob.findPage(imageb.images, { uid: tuser._id }, gt, lt, ps, filter, function (err, images, gt, lt) {
    if (err) return done(err);
    res.render('image/image-listu', {
      tuser: tuser,
      updatable: user && (user._id === tuser._id || user.admin),
      images: images,
      suffix: site.thumbnailSuffix,
      gt: gt ? new util2.UrlMaker(req.path).add('gt', gt).add('ps', ps, 16).done() : undefined,
      lt: lt ? new util2.UrlMaker(req.path).add('lt', lt).add('ps', ps, 16).done() : undefined
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
    image.cdateStr = util2.dateTimeString(image.cdate);
    done(null, image);
  });
}
