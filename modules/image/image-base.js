var exec = require('child_process').exec;

var init = require('../base/init');
var error = require('../base/error');
var fsp = require('../base/fs');
var config = require('../base/config');
var mongo = require('../mongo/mongo');

init.add(function () {
  error.define('IMAGE_NOT_EXIST', '파일이 없습니다.');
  error.define('IMAGE_CYCLE', '이미지는 하루 한 장 등록하실 수 있습니다.', 'files');
  error.define('IMAGE_NO_FILE', '아미지 파일이 첨부되지 않았습니다.', 'files');
  error.define('IMAGE_SIZE', '이미지의 가로, 세로 크기가 너무 작습니다.', 'files');
  error.define('IMAGE_TYPE', '인식할 수 없는 파일입니다.', 'files');
});

var imageDir;
var imageDirUrl;

var images;
var imageId;

init.add(function (done) {
  imageDir = exports.imageDir = config.uploadDir + '/public/images'
  imageDirUrl = config.uploadSiteUrl + '/images';
  fsp.makeDirs(imageDir, done);
});

init.add(function (done) {
  images = exports.images = mongo.db.collection("images");
  images.ensureIndex({ uid: 1, _id: -1 }, done);
});

init.add(function (done) {
  var opt = {
    fields: { _id: 1 },
    sort: { _id: -1 },
    limit: 1
  };
  images.find({}, opt).nextObject(function (err, obj) {
    if (err) return done(err);
    imageId = obj ? obj._id : 0;
    console.log('image-base: image id = ' + imageId);
    done();
  });
});

exports.newId = function () {
  return ++imageId;
};

var getVersionDir = exports.getVersionDir = function (id) {
  return imageDir + '/' + fsp.makeDeepPath(id, 3);
};

exports.getVersionUrlBase = function (id) {
  return imageDirUrl + '/' + fsp.makeDeepPath(id, 3)
}

exports.getVersionPath = function (dir, id, width) {
  return dir + '/' + id + '-' + width + '.jpg';
};

exports.getOrgPath = function (id, format) {
  return getVersionDir(id) + '/' + id + '.' + format;
}


exports.identify = function (fname, done) {
  exec('identify -format "%m %w %h" ' + fname, function (err, stdout, stderr) {
    if (err) return done(err);
    var a = stdout.split(/[ \n]/);
    var width = parseInt(a[1]) || 0;
    var height = parseInt(a[2]) || 0;
    var meta = {
      format: a[0].toLowerCase(),
      width: width,
      height: height,
      shorter: width > height ? height : width
    };
    done(null, meta);
  });
};
