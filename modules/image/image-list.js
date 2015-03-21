var init = require('../base/init');
var util2 = require('../base/util');
var error = require('../base/error');
var config = require('../base/config');
var mongo = require('../mongo/mongo');
var express2 = require('../main/express');
var userv = require('../user/user-view');
var imageb = require('../image/image-base');
var site = require('../image/image-site');

init.add(function () {
  var core = express2.core;

  core.get('/api/images', function (req, res, done) {
    var params = exports.getParams(req);
    exports.findImages(params, function (err, images, gt, lt) {
      if (err) return done(err);
      res.json({
        images: images,
        gt: gt,
        lt: lt
      });
    });
  });

  core.get('/', function (req, res, done) {
    var params = exports.getParams(req);
    exports.findImages(params, function (err, images, gt, lt) {
      if (err) return done(err);
      res.render('image/image-list', {
        images: images,
        showName: site.showListName,
        suffix: site.thumbnailSuffix,
        gtUrl: gt ? util2.makeUrl(('/'), { gt: gt }) : undefined,
        ltUrl: lt ? util2.makeUrl(('/'), { lt: lt }) : undefined
      });
    });
  });
});

exports.getParams = function (req) {
  var params = {};
  params.lt = parseInt(req.query.lt) || 0;
  params.gt = params.lt ? 0 : parseInt(req.query.gt) || 0;
  params.ps = parseInt(req.query.ps) || 16;
  return params;
};

exports.findImages = function (params, done) {
  var query = params.uid ? { uid: params.uid } : {};
  mongo.findPage(imageb.images, query, params.gt, params.lt, params.ps, modify, done);
};

function modify(image, done) {
  usera.getCached(image.uid, function (err, user) {
    if (err) return done(err);
    image.user = {
      _id: user._id,
      name: user.name,
      home: user.home
    };
    image.dir = imageb.getImageUrl(image._id);
    image.cdateStr = util2.toDateTimeString(image.cdate);
    done(null, image);
  });
}
