var should = require('should');

var error = require('../main/error');
var ecode = require('../error/ecode');

describe("error(number)", function () {
	it("should success", function () {
		var err = error(ecode.INVALID_DATA);
		err.rc.should.equal(ecode.INVALID_DATA.rc);
		err.message.should.equal(ecode.INVALID_DATA.message);
		err.should.property('stack');
	})
});

describe("error(field errors)", function () {
	it("should success", function () {
		var errors = [];
		errors.push(ecode.NAME_DUPE);
		errors.push(ecode.PASSWORD_EMPTY);
		var err = error(errors);
		err.rc.should.equal(ecode.ERRORS.rc);
		err.errors[0].should.eql(ecode.NAME_DUPE);
		err.errors[1].should.eql(ecode.PASSWORD_EMPTY);
	})
});

describe("error(field error)", function () {
	it("should success", function () {
		var err = error(ecode.NAME_DUPE);
		err.rc.should.equal(ecode.ERRORS.rc);
		err.errors[0].should.eql(ecode.NAME_DUPE);
	})
});

describe("error(unknown)", function () {
	it("should success", function () {
		var obj = { opt: 'extra' };
		var err = error(obj);
		err.should.not.have.property('rc');
		err.message.should.equal('unknown error');
		err.should.have.property('opt', 'extra')
		err.should.property('stack');
	});
});