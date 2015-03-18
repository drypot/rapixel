var fs = require('fs');

var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config');
var fs2 = require('../base/fs');
var express2 = require('../main/express');
var upload = require('../upload/upload');
var usera = require('../user/user-auth');
var imageb = require('../image/image-base');
var site = require('../image/image-site');

init.add(function () {
  var app = express2.app;

  app.post('/api/images', function (req, res) {
    usera.getUser(res, function (err, user) {
      if (err) return res.jsonErr(err);
      var form = getForm(req.body);
      createImages(form, user, function (err, ids) {
        if (err) return res.jsonErr(err);
        res.json({
          ids: ids
        });
      });
    });
  });

  app.get('/images/new', function (req, res) {
    usera.getUser(res, function (err, user) {
      if (err) return res.renderErr(err);
      var now = new Date();
      getTicketCount(now, user, function (err, count, hours) {
        res.render('image/image-create', {
          ticketMax: config.ticketMax,
          ticketCount: count,
          hours: hours
        });
      });
    });
  });
});

var getForm = exports.getForm = function (body) {
  var form = {};
  form.now = new Date();
  form.comment = body.comment || '';
  form.files = upload.normalizeFilenames(body.files);
  return form;
}

var getTicketCount = exports.getTicketCount = function(now, user, done) {
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

var createImages = exports.createImages = function(form, user, _done) {
  var done = upload.deleter(form.files, _done);
  if (!form.files.length) {
    return done(error(error.IMAGE_NO_FILE));
  }
  var i = 0;
  var ids = [];
  function create() {
    if (i == form.files.length) {
      return done(null, ids);
    }
    var file = form.files[i++];
    getTicketCount(form.now, user, function (err, count, hours) {
      if (err) return done(err);
      if (!count) {
        return done(null, ids);
      }
      createImage(form, file, user, function (err, id) {
        if (err) return done(err);
        ids.push(id);
        setImmediate(create);
      });
    });
  }
  create();
};

function createImage(form, file, user, done) {
  site.checkImageMeta(file.tpath, function (err, meta) {
    if (err) return done(err);
    var id = imageb.newId();
    var dir = imageb.getImageDir(id);
    fs2.makeDirs(dir, function (err) {
      if (err) return done(err);
      var org = imageb.getOriginalPath(dir, id, meta.format);
      fs.rename(file.tpath, org, function (err) {
        if (err) return done(err);
        site.makeVersions(org, meta, dir, id, function (err, vers) {
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
          imageb.images.insert(image, function (err) {
            if (err) return done(err);
            done(null, id);
          });
        });
      });
    });
  });
}

