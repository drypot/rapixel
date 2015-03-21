var chai = require('chai');
var expect = chai.expect;
chai.config.includeStack = true;

var fs = require('fs');

var fsp = require('../base/fs');

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
    expect(fs.existsSync(testdir + '/sub1')).true;
    expect(fs.existsSync(testdir + '/sub2')).true;
    expect(fs.existsSync(testdir + '/sub2/sub3')).true;
    expect(fs.existsSync(testdir + '/sub1/f1.txt')).true;
    expect(fs.existsSync(testdir + '/sub2/f2.txt')).true;
    expect(fs.existsSync(testdir + '/sub2/sub3/f3.txt')).true;
    fsp.removeDirs(testdir + '/sub2/f2.txt', function (err) {
      if (err) return done(err);
      expect(fs.existsSync(testdir + '/sub1')).true;
      expect(fs.existsSync(testdir + '/sub2')).true;
      expect(fs.existsSync(testdir + '/sub2/sub3')).true;
      expect(fs.existsSync(testdir + '/sub1/f1.txt')).true;
      expect(fs.existsSync(testdir + '/sub2/f2.txt')).false;
      expect(fs.existsSync(testdir + '/sub2/sub3/f3.txt')).true;
      done();
    })
  });
  it("can remove one dir", function (done) {
    expect(fs.existsSync(testdir + '/sub1')).true;
    expect(fs.existsSync(testdir + '/sub2')).true;
    expect(fs.existsSync(testdir + '/sub2/sub3')).true;
    expect(fs.existsSync(testdir + '/sub1/f1.txt')).true;
    expect(fs.existsSync(testdir + '/sub2/f2.txt')).true;
    expect(fs.existsSync(testdir + '/sub2/sub3/f3.txt')).true;
    fsp.removeDirs(testdir + '/sub1', function (err) {
      if (err) return done(err);
      expect(fs.existsSync(testdir + '/sub1')).false;
      expect(fs.existsSync(testdir + '/sub2')).true;
      expect(fs.existsSync(testdir + '/sub2/sub3')).true;
      expect(fs.existsSync(testdir + '/sub1/f1.txt')).false;
      expect(fs.existsSync(testdir + '/sub2/f2.txt')).true;
      expect(fs.existsSync(testdir + '/sub2/sub3/f3.txt')).true;
      done();
    })
  });
  it("can remove recursive", function (done) {
    expect(fs.existsSync(testdir + '/sub1')).true;
    expect(fs.existsSync(testdir + '/sub2')).true;
    expect(fs.existsSync(testdir + '/sub2/sub3')).true;
    expect(fs.existsSync(testdir + '/sub1/f1.txt')).true;
    expect(fs.existsSync(testdir + '/sub2/f2.txt')).true;
    expect(fs.existsSync(testdir + '/sub2/sub3/f3.txt')).true;
    fsp.removeDirs(testdir + '/sub2', function (err) {
      if (err) return done(err);
      expect(fs.existsSync(testdir + '/sub1')).true;
      expect(fs.existsSync(testdir + '/sub2')).false;
      expect(fs.existsSync(testdir + '/sub2/sub3')).false;
      expect(fs.existsSync(testdir + '/sub1/f1.txt')).true;
      expect(fs.existsSync(testdir + '/sub2/f2.txt')).false;
      expect(fs.existsSync(testdir + '/sub2/sub3/f3.txt')).false;
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
    fsp.emptyDir(testdir, function (err) {
      if (err) return done(err);
      fs.readdir(testdir, function (err, files) {
        if (err) return done(err);
        expect(files).length(0);
        done();
      });
    });
  });
});

describe("makeDirs", function () {
  before(function (done) {
    fsp.emptyDir(testdir, done);
  });
  it("can make dir", function (done) {
    expect(fs.existsSync(testdir + '/sub1')).be.false;
    fsp.makeDirs(testdir, 'sub1', function (err, dir) {
      expect(err).not.exist;
      expect(dir).equal(testdir + '/sub1');
      expect(fs.existsSync(testdir + '/sub1')).be.true;
      done();
    });
  });
  it("can make dir in existing dir", function (done) {
    expect(fs.existsSync(testdir + '/sub1/sub2')).be.false;
    fsp.makeDirs(testdir, 'sub1', 'sub2', function (err, dir) {
      expect(err).not.exist;
      expect(dir).equal(testdir + '/sub1/sub2');
      expect(fs.existsSync(testdir + '/sub1/sub2')).be.true;
      done();
    });
  });
  it("can make dirs with array ", function (done) {
    expect(fs.existsSync(testdir + '/ary1/ary2/ary3')).be.false;
    fsp.makeDirs(testdir, [ 'ary1', 'ary2', 'ary3' ], function (err, dir) {
      expect(err).not.exist;
      expect(dir).equal(testdir + '/ary1/ary2/ary3');
      expect(fs.existsSync(testdir + '/ary1/ary2/ary3')).be.true;
      done();
    });
  });
  it("can make dirs with string ", function (done) {
    expect(fs.existsSync(testdir + '/str1/str2/str3')).be.false;
    fsp.makeDirs(testdir, 'str1/str2/str3', function (err, dir) {
      expect(err).not.exist;
      expect(dir).equal(testdir + '/str1/str2/str3');
      expect(fs.existsSync(testdir + '/str1/str2/str3')).be.true;
      done();
    });
  });
  it("can make dirs with string and array ", function (done) {
    expect(fs.existsSync(testdir + '/c1/c2/c3/c4/c5')).be.false;
    fsp.makeDirs(testdir, 'c1', [ 'c2', 'c3' ], 'c4/c5', function (err, dir) {
      expect(err).not.exist;
      expect(dir).equal(testdir + '/c1/c2/c3/c4/c5');
      expect(fs.existsSync(testdir + '/c1/c2/c3/c4/c5')).be.true;
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
      var a = fsp.safeFilename(pair[0]);
      var b = pair[1];
      if (a !== b) console.log(pair);
      expect((a == b)).true;
    })
  });
});

describe("makeDeepPath", function () {
  it("should success", function () {
    expect(fsp.makeDeepPath(1, 3)).equal('0/0/1');
    expect(fsp.makeDeepPath(999, 3)).equal('0/0/999');
    expect(fsp.makeDeepPath(1000, 3)).equal('0/1/0');
    expect(fsp.makeDeepPath(1999, 3)).equal('0/1/999');
    expect(fsp.makeDeepPath(999999, 3)).equal('0/999/999');
    expect(fsp.makeDeepPath(1999999, 3)).equal('1/999/999');
    expect(fsp.makeDeepPath(999999999, 3)).equal('999/999/999');
    expect(fsp.makeDeepPath(9999999999, 3)).equal('9999/999/999');
  });
});