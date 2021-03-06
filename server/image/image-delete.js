var fs = require('fs');

var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config');
var fs2 = require('../base/fs2');
var expb = require('../express/express-base');
var expu = require('../express/express-upload');
var userb = require('../user/user-base');
var usera = require('../user/user-auth');
var imageb = require('../image/image-base');
var imageu = require('../image/image-update');

expb.core.delete('/api/images/:id([0-9]+)', function (req, res, done) {
  usera.checkUser(res, function (err, user) {
    if (err) return done(err);
    var id = parseInt(req.params.id) || 0;
    imageu.checkUpdatable(user, id, function (err) {
      if (err) return done(err);
      imageb.images.deleteOne({ _id: id }, function (err, cnt) {
        if (err) return done(err);
        fs2.removeDir(new imageb.Image(id).dir, function (err) {
          if (err) return done(err);
          res.json({});
        });
      });
    });
  });
});
