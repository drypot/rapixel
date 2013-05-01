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

	exports.logout = function (next) {
		request.del(url + '/api/sessions', function (err, res) {
			should.not.exist(err);
			res.should.have.status(200);
			should.not.exist(res.body.err);
			next();
		});
	}

	exports.loginUser = function (next) {
		request.post(url + '/api/sessions').send({ password: '1' }).end(function (err, res) {
			should.not.exist(err);
			res.should.have.status(200);
			should.not.exist(res.body.err);
			res.body.role.name.should.equal('user');
			next();
		});
	}

	exports.loginAdmin = function (next) {
		request.post(url + '/api/sessions').send({ password: '3' }).end(function (err, res) {
			should.not.exist(err);
			res.should.have.status(200);
			should.not.exist(res.body.err);
			res.body.role.name.should.equal('admin');
			next();
		});
	}

});
