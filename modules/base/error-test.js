var init = require('../base/init');
var error = require('../base/error');
var expect = require('../base/assert').expect

before(function (done) {
  init.run(done);
});

before(function () {
  error.define('NAME_DUPE', '이미 등록되어 있는 이름입니다.', 'name');
  error.define('PASSWORD_EMPTY', '비밀번호를 입력해 주십시오.', 'password');
});

describe('defining duplicated', function () {
  it('should fail', function (done) {
    expect(function() {
      error.define('NAME_DUPE', '이미 등록되어 있는 이름입니다.', 'name');
    }).throw();
    done();
  });  
});

describe('error(string)', function () {
  it('should success', function () {
    var err = error('INVALID_DATA');
    expect(err.code).equal(error.INVALID_DATA.code);
    expect(err.message).equal(error.INVALID_DATA.message);
    expect(err).property('stack');
  });
});

describe('error(field error)', function () {
  it('should success', function () {
    var err = error('NAME_DUPE');
    expect(err.code).equal(error.INVALID_FORM.code);
    expect(err.errors[0]).eql(error.NAME_DUPE);
  })
});

describe('error(field errors)', function () {
  it('should success', function () {
    var errors = [];
    errors.push(error.NAME_DUPE);
    errors.push(error.PASSWORD_EMPTY);
    var err = error(errors);
    expect(err.code).equal(error.INVALID_FORM.code);
    expect(err.errors[0]).eql(error.NAME_DUPE);
    expect(err.errors[1]).eql(error.PASSWORD_EMPTY);
  })
});

describe('error(unknown)', function () {
  it('should success', function () {
    var obj = { opt: 'extra' };
    var err = error(obj);
    expect(err).not.property('code');
    expect(err.message).equal('unknown error');
    expect(err).property('opt', 'extra')
    expect(err).property('stack');
  });
});

describe('error find', function () {
  it('should success', function () {
    var err = error('INVALID_DATA');
    expect(error.find(err, error.INVALID_DATA)).true;
    expect(error.find(err, error.INVALID_FORM)).false;
    expect(error.find(err, error.NAME_DUPE)).false;
  });
  it('form error should success', function () {
    var err = error('NAME_DUPE');
    expect(error.find(err, error.INVALID_DATA)).false;
    expect(error.find(err, error.INVALID_FORM)).false;
    expect(error.find(err, error.NAME_DUPE)).true;
  });
});

describe('chai error find', function () {
  it('should success', function () {
    var err = error('INVALID_DATA');
    expect(err).error('INVALID_DATA');
    expect(err).not.error('INVALID_FORM');
    expect(err).not.error('NAME_DUPE');
  });
});

