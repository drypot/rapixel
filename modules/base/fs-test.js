var should = require('should');
var fs = require('fs');

var fs2 = require('../base/fs');

var testdir = 'tmp/fs-test';

before(function (done) {
  fs.mkdir('tmp', 0755, function (err) {
    if (err && err.code !== 'EEXIST') return done(err);
    fs.mkdir('tmp/fs-test', 0755, function (err) {
      done();
    });
  });
});

describe("removeDirs", function () {
  beforeEach(function (done) {
    fs.mkdir(testdir + '/sub1', 0755, function (err) {
      fs.mkdir(testdir + '/sub2', 0755, function (err) {
        fs.mkdir(testdir + '/sub2/sub3', 0755, function (err) {
          fs.writeFileSync(testdir + '/sub1/f1.txt', 'abc');
          fs.writeFileSync(testdir + '/sub2/f2.txt', 'abc');
          fs.writeFileSync(testdir + '/sub2/sub3/f3.txt', 'abc');
          done();
        });
      });
    });
  });
  it("can remove one file", function (done) {
    fs.existsSync(testdir + '/sub1').should.true;
    fs.existsSync(testdir + '/sub2').should.true;
    fs.existsSync(testdir + '/sub2/sub3').should.true;
    fs.existsSync(testdir + '/sub1/f1.txt').should.true;
    fs.existsSync(testdir + '/sub2/f2.txt').should.true;
    fs.existsSync(testdir + '/sub2/sub3/f3.txt').should.true;
    fs2.removeDirs(testdir + '/sub2/f2.txt', function (err) {
      if (err) return done(err);
      fs.existsSync(testdir + '/sub1').should.true;
      fs.existsSync(testdir + '/sub2').should.true;
      fs.existsSync(testdir + '/sub2/sub3').should.true;
      fs.existsSync(testdir + '/sub1/f1.txt').should.true;
      fs.existsSync(testdir + '/sub2/f2.txt').should.false;
      fs.existsSync(testdir + '/sub2/sub3/f3.txt').should.true;
      done();
    })
  });
  it("can remove one dir", function (done) {
    fs.existsSync(testdir + '/sub1').should.true;
    fs.existsSync(testdir + '/sub2').should.true;
    fs.existsSync(testdir + '/sub2/sub3').should.true;
    fs.existsSync(testdir + '/sub1/f1.txt').should.true;
    fs.existsSync(testdir + '/sub2/f2.txt').should.true;
    fs.existsSync(testdir + '/sub2/sub3/f3.txt').should.true;
    fs2.removeDirs(testdir + '/sub1', function (err) {
      if (err) return done(err);
      fs.existsSync(testdir + '/sub1').should.false;
      fs.existsSync(testdir + '/sub2').should.true;
      fs.existsSync(testdir + '/sub2/sub3').should.true;
      fs.existsSync(testdir + '/sub1/f1.txt').should.false;
      fs.existsSync(testdir + '/sub2/f2.txt').should.true;
      fs.existsSync(testdir + '/sub2/sub3/f3.txt').should.true;
      done();
    })
  });
  it("can remove recursive", function (done) {
    fs.existsSync(testdir + '/sub1').should.true;
    fs.existsSync(testdir + '/sub2').should.true;
    fs.existsSync(testdir + '/sub2/sub3').should.true;
    fs.existsSync(testdir + '/sub1/f1.txt').should.true;
    fs.existsSync(testdir + '/sub2/f2.txt').should.true;
    fs.existsSync(testdir + '/sub2/sub3/f3.txt').should.true;
    fs2.removeDirs(testdir + '/sub2', function (err) {
      if (err) return done(err);
      fs.existsSync(testdir + '/sub1').should.true;
      fs.existsSync(testdir + '/sub2').should.false;
      fs.existsSync(testdir + '/sub2/sub3').should.false;
      fs.existsSync(testdir + '/sub1/f1.txt').should.true;
      fs.existsSync(testdir + '/sub2/f2.txt').should.false;
      fs.existsSync(testdir + '/sub2/sub3/f3.txt').should.false;
      done();
    })
  });
});

describe("emtpyDir", function () {
  before(function (done) {
    fs.mkdir(testdir + '/sub1', 0755, function (err) {
      fs.mkdir(testdir + '/sub2', 0755, function (err) {
        fs.mkdir(testdir + '/sub2/sub3', 0755, function (err) {
          fs.writeFileSync(testdir + '/sub1/f1.txt', 'abc');
          fs.writeFileSync(testdir + '/sub2/f2.txt', 'abc');
          fs.writeFileSync(testdir + '/sub2/sub3/f3.txt', 'abc');
          done();
        });
      });
    });
  });
  it("should success", function (done) {
    fs2.emptyDir(testdir, function (err) {
      if (err) return done(err);
      fs.readdir(testdir, function (err, files) {
        if (err) return done(err);
        files.should.length(0);
        done();
      });
    });
  });
});

describe("makeDirs", function () {
  before(function (done) {
    fs2.emptyDir(testdir, done);
  });
  it("can make dir", function (done) {
    fs.existsSync(testdir + '/sub1').should.be.false;
    fs2.makeDirs(testdir, 'sub1', function (err, dir) {
      should.not.exist(err);
      dir.should.equal(testdir + '/sub1');
      fs.existsSync(testdir + '/sub1').should.be.true;
      done();
    });
  });
  it("can make dir in existing dir", function (done) {
    fs.existsSync(testdir + '/sub1/sub2').should.be.false;
    fs2.makeDirs(testdir, 'sub1', 'sub2', function (err, dir) {
      should.not.exist(err);
      dir.should.equal(testdir + '/sub1/sub2');
      fs.existsSync(testdir + '/sub1/sub2').should.be.true;
      done();
    });
  });
  it("can make dirs with array ", function (done) {
    fs.existsSync(testdir + '/ary1/ary2/ary3').should.be.false;
    fs2.makeDirs(testdir, [ 'ary1', 'ary2', 'ary3' ], function (err, dir) {
      should.not.exist(err);
      dir.should.equal(testdir + '/ary1/ary2/ary3');
      fs.existsSync(testdir + '/ary1/ary2/ary3').should.be.true;
      done();
    });
  });
  it("can make dirs with string ", function (done) {
    fs.existsSync(testdir + '/str1/str2/str3').should.be.false;
    fs2.makeDirs(testdir, 'str1/str2/str3', function (err, dir) {
      should.not.exist(err);
      dir.should.equal(testdir + '/str1/str2/str3');
      fs.existsSync(testdir + '/str1/str2/str3').should.be.true;
      done();
    });
  });
  it("can make dirs with string and array ", function (done) {
    fs.existsSync(testdir + '/c1/c2/c3/c4/c5').should.be.false;
    fs2.makeDirs(testdir, 'c1', [ 'c2', 'c3' ], 'c4/c5', function (err, dir) {
      should.not.exist(err);
      dir.should.equal(testdir + '/c1/c2/c3/c4/c5');
      fs.existsSync(testdir + '/c1/c2/c3/c4/c5').should.be.true;
      done();
    });
  });
});

describe("safeFilename", function () {
  it("should success", function () {
    var table = [
      [ "`", "`" ], [ "~", "~" ],
      [ "!", "!" ], [ "@", "@" ], [ "#", "#" ], [ "$", "$" ], [ "%", "%" ],
      [ "^", "^" ], [ "&", "&" ], [ "*", "_" ], [ "(", "(" ], [ ")", ")" ],
      [ "-", "-" ], [ "_", "_" ], [ "=", "=" ], [ "+", "+" ],
      [ "[", "[" ], [ "[", "[" ], [ "]", "]" ], [ "]", "]" ], [ "\\", "_" ], [ "|", "_" ],
      [ ";", ";" ], [ ":", "_" ], [ "'", "'" ], [ "\"", "_" ],
      [ ",", "," ], [ "<", "_" ], [ ".", "." ], [ ">", "_" ], [ "/", "_" ], [ "?", "_" ],
      [ "aaa\tbbb", "aaa_bbb" ],
      [ "abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ 1234567890", "abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ 1234567890" ],
      [ "이상한 '한글' 이름을 가진 파일", "이상한 '한글' 이름을 가진 파일" ]
    ];
    table.forEach(function (pair) {
      var a = fs2.safeFilename(pair[0]);
      var b = pair[1];
      if (a !== b) console.log(pair);
      (a == b).should.true;
    })
  });
});

describe("makeDeepPath", function () {
  it("should success", function () {
    fs2.makeDeepPath('tmp', 1, 3).should.equal('tmp/0/0/1');
    fs2.makeDeepPath('tmp', 999, 3).should.equal('tmp/0/0/999');
    fs2.makeDeepPath('tmp', 1000, 3).should.equal('tmp/0/1/0');
    fs2.makeDeepPath('tmp', 1999, 3).should.equal('tmp/0/1/999');
    fs2.makeDeepPath('tmp', 999999, 3).should.equal('tmp/0/999/999');
    fs2.makeDeepPath('tmp', 1999999, 3).should.equal('tmp/1/999/999');
    fs2.makeDeepPath('tmp', 999999999, 3).should.equal('tmp/999/999/999');
    fs2.makeDeepPath('tmp', 9999999999, 3).should.equal('tmp/9999/999/999');
  });
});