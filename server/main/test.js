var should = require('should');

var init = require('../main/init');
var config = require('../main/config');
var error = require('../main/error');

var opt = {};

exports = module.exports = function (_opt) {
	for(var p in _opt) {
		opt[p] = _opt[p];
	}
	return exports;
};

init.add(function () {

	var url = exports.url = 'http://localhost:' + config.data.port;
	var request = opt.request;

	exports.createUser = function (next) {
		var form = { name: 'snowman', email: 'abc@def.com', password: '1234' };
		request.post(url + '/api/users').send(form).end(function (err,res) {
			should(!res.body.err);
			next();
		});
	}
	exports.logout = function (next) {
		request.del(url + '/api/sessions', function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			next();
		});
	}

	exports.loginUser = function (next) {
		var form = { email: 'abc@def.com', password: '1234' };
		request.post(url + '/api/sessions').send(form).end(function (err, res) {
			should(!err);
			should(!res.error);
			should(!res.body.err);
			next();
		});
	}

//	exports.loginAdmin = function (next) {
//		request.post(url + '/api/sessions').send({ password: '3' }).end(function (err, res) {
//			should(!err);
//			should(!res.error);
//			should(!res.body.err);
//			res.body.role.name.should.equal('admin');
//			next();
//		});
//	}

});
