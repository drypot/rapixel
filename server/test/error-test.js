var should = require('should');

var error = require('../main/error');
var Errors = error.Errors;

describe("error(number)", function () {
	it("should success", function () {
		var err = error(error.INVALID_DATA);
		err.should.have.property('rc', error.INVALID_DATA);
		err.message.should.equal(error.msg[error.INVALID_DATA]);
		err.should.property('stack');
	})
});

describe("error(string)", function () {
	it("should success", function () {
		var msg = 'unknown error';
		var err = error(msg);
		err.should.not.have.property('rc');
		err.message.should.equal(msg);
		err.should.property('stack');
	})
});

describe("error(errors)", function () {
	it("should success", function () {
		var errors = new Errors();
		errors.add('email', 'email error');
		errors.add('password', 'password error');
		var err = error(errors);
		err.rc.should.equal(error.ERROR_SET);
		err.errors[0].name.should.equal('email');
		err.errors[0].msg.should.equal('email error');
		err.errors[1].name.should.equal('password');
		err.errors[1].msg.should.equal('password error');
	})
});

describe("error(name, msg)", function () {
	it("should success", function () {
		var err = error('email', 'email error');
		err.rc.should.equal(error.ERROR_SET);
		err.errors[0].name.should.equal('email');
		err.errors[0].msg.should.equal('email error');
	})
});

describe("error(object without rc)", function () {
	it("should success", function () {
		var obj = { opt: 'extra' };
		var err = error(obj);
		err.should.not.have.property('rc');
		err.message.should.equal('unknown error');
		err.should.have.property('opt', 'extra')
		err.should.property('stack');
	})
});