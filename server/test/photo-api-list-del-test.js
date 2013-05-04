var should = require('should');
var request = require('superagent').agent();

var init = require('../main/init');
var config = require('../main/config')({ test: true });
var mongo = require('../main/mongo')({ dropDatabase: true });
var upload = require('../main/upload');
var express = require('../main/express');
var error = require('../main/error');
var ufix = require('../test/user-fixture');

require('../main/photo-api');
require('../main/session-api');
require('../main/user-api');

before(function (next) {
	init.run(next);
});

before(function () {
	express.listen();
});