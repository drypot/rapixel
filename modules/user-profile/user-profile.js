var init = require('../base/init');
var utilp = require('../base/util');
var error = require('../base/error');
var exp = require('../express/express');
var userb = require('../user/user-base');
var imagel = require('../image/image-list');
var site = require('../image/image-site');

exp.core.get('/users/:id([0-9]+)', function (req, res, done) {
  var id = parseInt(req.params.id) || 0;
  renderProfile(req, res, id);
});

exp.core.get('/:name([^/]+)', function (req, res, done) {
  var homel = decodeURIComponent(req.params.name).toLowerCase();
  userb.getCachedByHome(homel, function (err, _user) {
    if (!_user) return done();
    var user = res.locals.user;
    var params = imagel.getParams(req);
    params.uid = _user._id;
    imagel.findImages(params, function (err, images, gt, lt) {
      if (err) return done(err);
      res.render('user-profile/user-profile', {
        tuser: _user,
        updatable: user && (user.admin || user._id === _user._id),
        images: images,
        suffix: site.thumbnailSuffix,
        gtUrl: gt ? utilp.makeUrl(req.path, { gt: gt }) : undefined,
        ltUrl: lt ? utilp.makeUrl(req.path, { lt: lt }) : undefined
      });
    });
  });
});
