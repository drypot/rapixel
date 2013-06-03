var should = require('should');

var error = require('../main/error');
var ecode = require('../main/ecode');

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
		errors.push(ecode.fields.NAME_DUPE);
		errors.push(ecode.fields.PASSWORD_EMPTY);
		var err = error(errors);
		err.rc.should.equal(ecode.ERROR_SET.rc);
		err.errors[0].should.eql(ecode.fields.NAME_DUPE);
		err.errors[1].should.eql(ecode.fields.PASSWORD_EMPTY);
	})
});

describe("error(field error)", function () {
	it("should success", function () {
		var err = error(ecode.fields.NAME_DUPE);
		err.rc.should.equal(ecode.ERROR_SET.rc);
		err.errors[0].should.eql(ecode.fields.NAME_DUPE);
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