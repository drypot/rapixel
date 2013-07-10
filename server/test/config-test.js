var should = require('should');

var init = require('../main/init');
var config = require('../main/config');

describe("config with invalid path", function () {
	it("should fail", function (next) {
		config({ reset: true, path: 'config/none.json' });
		init.run(function (err) {
			should.exists(err);
			err.code.should.equal('ENOENT');
			next();
		});
	});
});

describe("config with test: true", function () {
	it("should success", function (next) {
		config({ reset: true, test: true });
		init.run(function (err) {
			should(!err);
			should(config.data.appName);
			next();
		});
	});
});

describe("config with valid path", function () {
	it("should success", function (next) {
		config({ reset: true, path: 'config/test.json' });
		init.run(function (err) {
			should(!err);
			should(config.data.appName);
			next();
		});
	});
});