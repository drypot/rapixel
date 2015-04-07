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

exp.core.get('/api/images', function (req, res, done) {
  var params = imagel.getParams(req);
  imagel.findImages(params, function (err, images, gt, lt) {
    if (err) return done(err);
    res.json({
      images: images,
      gt: gt,
      lt: lt
    });
  });
});

exp.core.get('/', function (req, res, done) {
  var params = imagel.getParams(req);
  imagel.findImages(params, function (err, images, gt, lt) {
    if (err) return done(err);
    res.render('image/image-list', {
      images: images,
      showName: site.showListName,
      suffix: site.thumbnailSuffix,
      gtUrl: gt ? utilp.makeUrl(('/'), { gt: gt }) : undefined,
      ltUrl: lt ? utilp.makeUrl(('/'), { lt: lt }) : undefined
    });
  });
});

imagel.getParams = function (req) {
  var params = {};
  params.lt = parseInt(req.query.lt) || 0;
  params.gt = params.lt ? 0 : parseInt(req.query.gt) || 0;
  params.ps = parseInt(req.query.ps) || 16;
  return params;
};

imagel.findImages = function (params, done) {
  var query = params.uid ? { uid: params.uid } : {};
  mongop.findPage(imageb.images, query, params.gt, params.lt, params.ps, filter, done);
};

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
