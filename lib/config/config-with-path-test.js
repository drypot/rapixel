var should = require('should');

var init = require('../lang/init');
var config = require('../config/config')({ path: 'config/rapixel-test.json' });

describe("config with valid path", function () {
	it("should success", function (next) {
		init.run(function (err) {
			should(!err);
			should(config.appName);
			should(!config.xxx);
			next();
		});
	});
});

