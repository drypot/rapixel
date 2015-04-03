var init = require('../base/init');
var utilp = require('../base/util');
var error = require('../base/error');
var exp = require('../main/express');
var usera = require('../user/user-auth');
var imagel = require('../image/image-list');
var site = require('../image/image-site');

init.add(function () {
  exp.core.get('/users/:id([0-9]+)', function (req, res, done) {
    var id = parseInt(req.params.id) || 0;
    renderProfile(req, res, id);
  });

  exp.core.get('/:name([^/]+)', function (req, res, done) {
    var homel = decodeURIComponent(req.params.name).toLowerCase();
    usera.getCachedByHome(homel, function (err, user) {
      if (!user) return done();
      renderProfile(req, res, user._id);
    });
  });
});

function renderProfile(req, res, id) {
  var user = res.locals.user;
  usera.getCached(id, function (err, tuser) {
    if (err) return done(err);
    var params = imagel.getParams(req);
    params.uid = id;
    imagel.findImages(params, function (err, images, gt, lt) {
      if (err) return done(err);
      res.render('user-profile/user-profile', {
        tuser: tuser,
        updatable: user && (user.admin || user._id === id),
        images: images,
        suffix: site.thumbnailSuffix,
        gtUrl: gt ? utilp.makeUrl(req.path, { gt: gt }) : undefined,
        ltUrl: lt ? utilp.makeUrl(req.path, { lt: lt }) : undefined
      });
    });
  });
};

