var should = require('should');

var init = require('../lang/init');
var error = require('../error/error');
var config = require('../config/config')({ path: 'config/test-rapixel.json' });

before(function (next) {
	init.run(next);
});

before(function () {
	error.define('NAME_DUPE', 'name', '이미 등록되어 있는 이름입니다.');
	error.define('PASSWORD_EMPTY', 'password', '비밀번호를 입력해 주십시오.');
});

describe("error(error)", function () {
	it("should success", function () {
		var err = error(error.INVALID_DATA);
		err.code.should.equal(error.INVALID_DATA.code);
		err.message.should.equal(error.INVALID_DATA.message);
		err.should.property('stack');
	});
});

describe("error(field errors)", function () {
	it("should success", function () {
		var errors = [];
		errors.push(error.NAME_DUPE);
		errors.push(error.PASSWORD_EMPTY);
		var err = error(errors);
		err.code.should.equal(error.MULTIPLE.code);
		err.errors[0].should.eql(error.NAME_DUPE);
		err.errors[1].should.eql(error.PASSWORD_EMPTY);
	})
});

describe("error(field error)", function () {
	it("should success", function () {
		var err = error(error.NAME_DUPE);
		err.code.should.equal(error.MULTIPLE.code);
		err.errors[0].should.eql(error.NAME_DUPE);
	})
});

describe("error(unknown)", function () {
	it("should success", function () {
		var obj = { opt: 'extra' };
		var err = error(obj);
		err.should.not.have.property('code');
		err.message.should.equal('unknown error');
		err.should.have.property('opt', 'extra')
		err.should.property('stack');
	});
});
