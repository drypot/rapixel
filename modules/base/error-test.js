var chai = require('chai');
var expect = chai.expect;
chai.config.includeStack = true;

var init = require('../base/init');
var error = require('../base/error');

before(function (done) {
  init.run(done);
});

before(function () {
  error.define('NAME_DUPE', '이미 등록되어 있는 이름입니다.', 'name');
  error.define('PASSWORD_EMPTY', '비밀번호를 입력해 주십시오.', 'password');
});

describe("error(error)", function () {
  it("should success", function () {
    var err = error(error.INVALID_DATA);
    expect(err.code).equal(error.INVALID_DATA.code);
    expect(err.message).equal(error.INVALID_DATA.message);
    expect(err).property('stack');
  });
});

describe("defining duplicated", function () {
  it("should fail", function (done) {
    expect(function() {
      error.define('NAME_DUPE', '이미 등록되어 있는 이름입니다.', 'name');
    }).throw();
    done();
  });  
});

describe("error(field errors)", function () {
  it("should success", function () {
    var errors = [];
    errors.push(error.NAME_DUPE);
    errors.push(error.PASSWORD_EMPTY);
    var err = error(errors);
    expect(err.code).equal(error.INVALID_FORM.code);
    expect(err.errors[0]).eql(error.NAME_DUPE);
    expect(err.errors[1]).eql(error.PASSWORD_EMPTY);
  })
});

describe("error(field error)", function () {
  it("should success", function () {
    var err = error(error.NAME_DUPE);
    expect(err.code).equal(error.INVALID_FORM.code);
    expect(err.errors[0]).eql(error.NAME_DUPE);
  })
});

describe("error(unknown)", function () {
  it("should success", function () {
    var obj = { opt: 'extra' };
    var err = error(obj);
    expect(err).not.have.property('code');
    expect(err.message).equal('unknown error');
    expect(err).have.property('opt', 'extra')
    expect(err).property('stack');
  });
});
