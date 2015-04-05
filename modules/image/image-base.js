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
  imageDirUrl = config.uploadSite + '/images';
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

// 원본과 버젼이 같은 디렉토리에 저장된다는 것을 전제로 작명하였다.
// 아무래도 원본과 버젼이 같은 디렉토리에 있는 것이 좋을 것 같다.
// 같은 형태끼리 모으지 말고 관련된 것 끼리 모아놓는다는 철학.
// 스토리지가 부족하면 원본/버젼을 분리할 것이 아니라
// id 영역별로 나누는 방안을 고려하면 된다.

// 원본 파일에 -org 를 붙여 놓는다.
// DB 없이 파일명으로 검색에 편리.

var ImageDir = exports.ImageDir = function (id, format) {
  this.id = id;
  this.dir = imageDir + '/' + fsp.makeDeepPath(id, 3);
  if (format) {
    this.orgPath = this.dir + '/' + id + '-org.' + format;
  }
}

ImageDir.prototype.getVersionPath = function (width) {
  return this.dir + '/' + this.id + '-' + width + '.jpg';
}

exports.getUrlBase = function (id) {
  return imageDirUrl + '/' + fsp.makeDeepPath(id, 3)
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
