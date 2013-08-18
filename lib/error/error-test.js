var should = require('should');

var init = require('../lang/init');
var config = require('../config/config')({ path: 'config/test-rapixel.json' });
var error = require('../error/error');

before(function (next) {
	init.run(next);
});

describe("error(number)", function () {
	it("should success", function () {
		var err = error(error.ids.INVALID_DATA);
		err.code.should.equal(error.ids.INVALID_DATA.code);
		err.message.should.equal(error.ids.INVALID_DATA.message);
		err.should.property('stack');
	});
});

describe("error(field errors)", function () {
	it("should success", function () {
		var errors = [];
		errors.push(error.ids.NAME_DUPE);
		errors.push(error.ids.PASSWORD_EMPTY);
		var err = error(errors);
		err.code.should.equal(error.ids.MULTIPLE.code);
		err.errors[0].should.eql(error.ids.NAME_DUPE);
		err.errors[1].should.eql(error.ids.PASSWORD_EMPTY);
	})
});

describe("error(field error)", function () {
	it("should success", function () {
		var err = error(error.ids.NAME_DUPE);
		err.code.should.equal(error.ids.MULTIPLE.code);
		err.errors[0].should.eql(error.ids.NAME_DUPE);
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
