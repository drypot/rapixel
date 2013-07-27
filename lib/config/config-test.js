var should = require('should');

var init = require('../lang/init');
var config = require('../config/config');

describe("config with valid path", function () {
	it("should success", function (next) {
		config({ path: 'config/test.json' });
		init.run(function (err) {
			should(!err);
			should(config.data.appName);
			next();
		});
	});
});

describe("config with invalid path", function () {
	it("should fail", function (next) {
		config({ path: 'config/none.json' });
		init.run(function (err) {
			should(err);
			err.code.should.equal('ENOENT');
			next();
		});
	});
});
