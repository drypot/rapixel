var init = require('../base/init');
var utilp = require('../base/util');
var error = require('../base/error');
var config = require('../base/config');
var mongop = require('../mongo/mongo');
var exp = require('../express/express');
var userb = require('../user/user-base');
var imageb = require('../image/image-base');
var site = require('../image/image-site');
var imagel = exports;

exp.core.get('/', function (req, res, done) {
  list(req, res, false, done);
});

exp.core.get('/api/images', function (req, res, done) {
  list(req, res, true, done);
});

function list(req, res, api, done) {
  var lt = parseInt(req.query.lt) || 0;
  var gt = lt ? 0 : parseInt(req.query.gt) || 0;
  var ps = parseInt(req.query.ps) || 16;
  mongop.findPage(imageb.images, {}, gt, lt, ps, filter, function (err, images, gt, lt) {
    if (err) return done(err);
    if (api) {
      res.json({
        images: images,
        gt: gt,
        lt: lt
      });
    } else {
     res.render('image/image-list', {
       images: images,
       showName: site.showListName,
       suffix: site.thumbnailSuffix,
       gt: gt ? new utilp.UrlMaker('/').add('gt', gt).add('ps', ps, 16).done() : undefined,
       lt: lt ? new utilp.UrlMaker('/').add('lt', lt).add('ps', ps, 16).done() : undefined
     });
    }
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
