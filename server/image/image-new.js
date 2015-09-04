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
var site = require('../image/image-site');
var imagen = exports;

expb.core.get('/images/new', function (req, res, done) {
  usera.checkUser(res, function (err, user) {
    if (err) return done(err);
    var now = new Date();
    getTicketCount(now, user, function (err, count, hours) {
      res.render('image/image-new', {
        ticketMax: config.ticketMax,
        ticketCount: count,
        hours: hours
      });
    });
  });
});

expb.core.post('/api/images', expu.handler(function (req, res, done) {
  usera.checkUser(res, function (err, user) {
    if (err) return done(err);
    var form = getForm(req);
    if (!form.files) {
      return done(error('IMAGE_NO_FILE'));
    }
    var i = 0;
    var ids = [];
    (function create() {
      if (i < form.files.length) {
        var file = form.files[i++];
        getTicketCount(form.now, user, function (err, count, hours) {
          if (err) return done(err);
          if (!count) {
            res.json({ ids: ids });
            return done();
          }
          site.checkImageMeta(file.path, function (err, meta) {
            if (err) return done(err);
            var id = imageb.getNewId();
            var path = new imageb.FilePath(id, meta.format);
            fs2.makeDir(path.dir, function (err) {
              if (err) return done(err);
              fs.rename(file.path, path.original, function (err) {
                if (err) return done(err);
                site.makeVersions(path, meta, function (err, vers) {
                  if (err) return done(err);
                  var image = {
                    _id: id,
                    uid: user._id,
                    hit: 0,
                    fname: file.safeFilename,
                    format: meta.format,
                    cdate: form.now
                  };
                  site.fillFields(image, form, meta, vers);
                  imageb.images.insertOne(image, function (err) {
                    if (err) return done(err);
                    ids.push(id);
                    setImmediate(create);
                  });
                });
              });
            });
          });
        });
        return;
      }
      res.json({ ids: ids });
      done();
    })();
  });
}));

var getForm = imagen.getForm = function (req) {
  var body = req.body;
  var form = {};
  form.now = new Date();
  form.comment = body.comment || '';
  form.files = req.files && req.files.files;
  return form;
}

var getTicketCount = imagen.getTicketCount = function(now, user, done) {
  var count = config.ticketMax;
  var hours;
  var opt = {
    fields: { cdate: 1 },
    sort: { uid: 1, _id: -1 },
    limit: config.ticketMax
  }
  imageb.images.find({ uid: user._id }, opt).toArray(function (err, images) {
    if (err) return done(err);
    for (var i = 0; i < images.length; i++) {
      hours = config.ticketGenInterval - Math.floor((now.getTime() - images[i].cdate.getTime()) / (60 * 60 * 1000));
      if (hours > 0) {
        count--;
      } else {
        break;
      }
    }
    done(null, count, hours);
  });
};
