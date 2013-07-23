var should = require('should');

var dt = require('../main/dt');

describe("formatDate", function () {
	it("should success", function () {
		var d = new Date(1974, 4, 16, 12, 0);
		dt.format(d).should.equal('1974-05-16 12:00:00');
	})
});
