var should = require('should');
var express = require('express');
var redisStore = require('connect-redis')(express);

var init = require('../lang/init');
var config = require('../config/config');
var ecode = require('../error/ecode');

var app = express();
var opt = {};

exports = module.exports = function (_opt) {
	for(var p in _opt) {
		opt[p] = _opt[p];
	}
	return exports;
};

init.add(function () {
	exports.app = app;

	// Set Middlewares

	app.disable('x-powered-by');
	app.locals.pretty = true;
	app.locals.appName = config.data.appName;
	app.locals.appDesc = config.data.appDesc;

	app.engine('jade', require('jade').renderFile);
	app.set('view engine', 'jade');
	app.set('views', __dirname);

	app.use(express.cookieParser(config.data.cookieSecret));
	app.use(express.session({ store: new redisStore({ ttl: 1800 /* 단위: 초. 30 분 */ }) }));
	app.use(express.bodyParser({ uploadDir: config.data.uploadDir + '/tmp' }));

	app.use(function (req, res, next) {
		res.locals.query = req.query;
		if (res.locals.api = /^\/api\//.test(req.path)) {
			// solve IE ajax caching problem.
			res.set('Cache-Control', 'no-cache');
		} else {
			// force web page cacehd.
			res.set('Cache-Control', 'private');
		}
		next();
	});

	if (exports.userSession) {
		app.use(exports.userSession);
	}

	app.get('/api/hello', function (req, res) {
		res.json({
			name: config.data.appName,
			time: Date.now()
		});
	});

	app.get('/error', function (req, res) {
		var err = new Error('Error Sample Page');
		err.rc = 999;
		res.render('error', {
			err: err
		});
	});
});

// App Functions

exports.listen = function () {
	app.use(express.errorHandler());
	app.listen(config.data.appPort);
	console.log('express: listening ' + config.data.appPort);
};

// Test Util

var treq = require('superagent').agent();

exports.resetTestSession = function () {
	treq = require('superagent').agent();
};

var methods = [ 'post', 'get', 'put', 'del' ];

for (var i = 0; i < methods.length; i++) {
	var method = methods[i];
	exports[method] = (function (method) {
		return function () {
			arguments[0] = 'http://localhost:' + config.data.appPort + arguments[0];
			return treq[method].apply(treq, arguments);
		}
	})(method);
}

// Error Util

var emptyMatch = [''];

should(!express.response.jsonErr);
express.response.jsonErr = function (_err) {
	var res = this;
	var err = {};
	for (var key in _err) {
		err[key] = _err[key];
	}
	err.message = _err.message;
	err.stack = (_err.stack.match(/^(?:.*\n){1,6}/m) || emptyMatch)[0];
	res.json({ err: err });
};

should(!express.response.renderErr);
express.response.renderErr = function (_err) {
	var res = this;
	if (_err.rc && _err.rc == ecode.NOT_AUTHENTICATED.rc) {
		res.redirect('/users/login');
		return;
	}
	var err = {};
	for (var key in _err) {
		err[key] = _err[key];
	}
	err.message = _err.message;
	err.stack = (_err.stack.match(/^(?:.*\n){1,6}/m) || emptyMatch)[0].replace(/Error:.+\n/, '');
	res.render('error', { err: err });
};
