var should = require('should');
var express = require('express');
var redisStore = require('connect-redis')(express);

var init = require('../lang/init');
var config = require('../config/config');
var error = require('../error/error');
var ecode = require('../error/ecode');

var opt = {};

exports = module.exports = function (_opt) {
	for(var p in _opt) {
		opt[p] = _opt[p];
	}
	return exports;
};

init.add(function () {

	var app = exports.app = express();

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

	// App Functions

	exports.listen = function () {

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

		app.use(express.errorHandler());

		app.listen(config.data.appPort);
		console.log('express: listening ' + config.data.appPort);
	};

	// Test Util

	var testReq;

	exports.resetTestSession = function () {
		testReq = require('superagent').agent();
	};

	exports.resetTestSession();

	var methods = [ 'post', 'get', 'put', 'del' ];

	for (var i = 0; i < methods.length; i++) {
		var method = methods[i];
		exports[method] = (function (method) {
			return function () {
				arguments[0] = 'http://localhost:' + config.data.appPort + arguments[0];
				return testReq[method].apply(testReq, arguments);
			}
		})(method)
	}

	// Respose Util

	var emptyMatch = [''];

	app.response.jsonErr = function (err) {
		var err2 = {};
		for (var key in err) {
			err2[key] = err[key];
		}
		err2.message = err.message;
		err2.stack = (err.stack.match(/^(?:.*\n){1,6}/m) || emptyMatch)[0];
		this.json({ err: err2 });
	};

	app.response.renderErr = function (err) {
		if (err.rc && err.rc == ecode.NOT_AUTHENTICATED.rc) {
			this.redirect('/users/login');
			return;
		}
		var err2 = {};
		for (var key in err) {
			err2[key] = err[key];
		}
		err2.message = err.message;
		err2.stack = (err.stack.match(/^(?:.*\n){1,6}/m) || emptyMatch)[0].replace(/Error:.+\n/, '');
		this.render('error', { err: err2 });
	};
});
