var fs = require('fs');

var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config');
var fsp = require('../base/fs');
var exp = require('../express/express');
var upload = require('../express/upload');
var userb = require('../user/user-base');
var imageb = require('../image/image-base');
var site = require('../image/image-site');
var imagec = exports;

exp.core.post('/api/images', upload.handler(function (req, res, done) {
  userb.checkUser(res, function (err, user) {
    if (err) return done(err);
    var form = imagec.getForm(req);
    createImages(form, user, function (err, ids) {
      if (err) return done(err);
      res.json({
        ids: ids
      });
      // 오류 없이 처리되었다면 임시파일들은 정상보관되었을 것이기 때문에
      // done() 을 호출해서 임시파일 삭제를 안 해도 되긴 하다.
      done();
    });
  });
}));

exp.core.get('/images/new', function (req, res, done) {
  userb.checkUser(res, function (err, user) {
    if (err) return done(err);
    var now = new Date();
    imagec.getTicketCount(now, user, function (err, count, hours) {
      res.render('image/image-create', {
        ticketMax: config.ticketMax,
        ticketCount: count,
        hours: hours
      });
    });
  });
});

imagec.getForm = function (req) {
  var body = req.body;
  var form = {};
  form.now = new Date();
  form.comment = body.comment || '';
  form.files = req.files && req.files.files || [];
  return form;
}

imagec.getTicketCount = function(now, user, done) {
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

function createImages(form, user, done) {
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
    imagec.getTicketCount(form.now, user, function (err, count, hours) {
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
  site.checkImageMeta(file.path, function (err, meta) {
    if (err) return done(err);
    var id = imageb.newId();
    var dir = new imageb.ImageDir(id, meta.format);
    fsp.makeDirs(dir.dir, function (err) {
      if (err) return done(err);
      fs.rename(file.path, dir.orgPath, function (err) {
        if (err) return done(err);
        site.makeVersions(dir, meta, function (err, vers) {
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

