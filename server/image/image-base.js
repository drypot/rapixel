var exec = require('child_process').exec;

var init = require('../base/init');
var error = require('../base/error');
var fs2 = require('../base/fs2');
var config = require('../base/config');
var mongob = require('../mongo/mongo-base');
var imageb = exports;

error.define('IMAGE_NOT_EXIST', '파일이 없습니다.');
error.define('IMAGE_CYCLE', '이미지는 하루 한 장 등록하실 수 있습니다.', 'files');
error.define('IMAGE_NO_FILE', '아미지 파일이 첨부되지 않았습니다.', 'files');
error.define('IMAGE_SIZE', '이미지의 가로, 세로 크기가 너무 작습니다.', 'files');
error.define('IMAGE_TYPE', '인식할 수 없는 파일입니다.', 'files');

// images

var imageId;

init.add(function (done) {
  imageb.images = mongob.db.collection('images');
  imageb.images.createIndex({ uid: 1, _id: -1 }, done);
});

init.add(function (done) {
  mongob.getLastId(imageb.images, function (err, id) {
    if (err) return done(err);
    imageId = id;
    console.log('image-base: image id = ' + imageId);
    done();
  });
});

imageb.getNewId = function () {
  return ++imageId;
};

/*
  이미지 파일 관리

  원본과 버젼이 같은 디렉토리에 저장된다는 것을 전제로 작명하였다.
  원본과 버젼이 같은 디렉토리에 있는 것이 좋을 것 같다.
  같은 형태끼리 모으지 말고 관련된 것 끼리 모아 놓는다.
  스토리지가 부족하면 원본/버젼을 분리할 것이 아니라
  id 영역별로 나누는 방안을 고려하면 된다.

  원본 파일에 -org 를 붙여 놓는다.
  DB 없이 파일명으로 검색이 가능.
*/

var uploadDir;

init.add(function (done) {
  fs2.makeDir(config.uploadDir + '/public/images', function (err, dir) {
    if (err) return done(err);
    uploadDir = dir;
    done();
  });
});

init.add(function (done) {
  if (config.dev) {
    imageb.emptyDir = function (done) {
      fs2.emptyDir(uploadDir, done);
    }
  }
  done();
});

imageb.Image = function (id, format) {
  this.id = id;
  this.dir = uploadDir + '/' + fs2.makeDeepPath(id, 3);
  if (format) {
    this.original = this.dir + '/' + id + '-org.' + format;
  }
}

imageb.Image.prototype.getPath = function (width) {
  return this.dir + '/' + this.id + '-' + width + '.jpg';
}

imageb.getDirUrl = function (id) {
  return config.uploadSite + '/images/' + fs2.makeDeepPath(id, 3)
}

imageb.identify = function (fname, done) {
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
