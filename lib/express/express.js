var should = require('should');
var express = require('express');
var redisStore = require('connect-redis')(express);

var init = require('../lang/init');
var config = require('../config/config');
var session = require('../main/session');
var upload = require('../upload/upload');
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

	app.disable('x-powered-by');

	app.engine('jade', require('jade').renderFile);
	app.set('view engine', 'jade'); // default view engine
	app.set('views', process.cwd() + '/client/jade'); // view root
	app.locals.pretty = true;

	app.locals.appName = config.data.appName;

	app.use(express.cookieParser(config.data.cookieSecret));

	app.use(express.session({ store: new redisStore({ ttl: 1800 /* 단위: 초. 30 분 */ }) }));
	console.log('express: redis');

//	app.use(express.session());
//	log += ' memory';

	app.use(express.bodyParser({ uploadDir: upload.tmpDir }));

	var apiRe = /^\/api\//;

	app.use(function (req, res, next) {
		res.locals.query = req.query;
		var api = res.locals.api = apiRe.test(req.path);
		if (api) {
			// solve IE ajax caching problem.
			res.set('Cache-Control', 'no-cache');
		} else {
			// force web page cacehd.
			res.set('Cache-Control', 'private');
		}
		next();
	});

	app.use(session.setLocals);

	app.use(app.router);

	app.use(express.errorHandler());

	// 사용자 확인을 미들웨어로 할 경우 리턴 형식을 결정하기 어려워진다.
	// res.locals.api 로 확인할 수 없다.
	// /upload 같은 경우 html url 이지만 json 을 리턴해야 한다.

	app.request.checkUser = function (next) {
		var req = this;
		var res = this.res;
		var user = res.locals.user;
		if (!user) {
			return next(error(ecode.NOT_AUTHENTICATED));
		}
		next(null, user);
	};

	app.request.checkAdmin = function (next) {
		var req = this;
		var res = this.res;
		var user = res.locals.user;
		if (!user) {
			return next(error(ecode.NOT_AUTHENTICATED));
		}
		if (!user.admin) {
			return next(error(ecode.NOT_AUTHORIZED));
		}
		next(null, user);
	};

	var emptyMatch = [''];

	app.response.jsonErr = function (err) {
		var err2 = {};
		for (var key in err) {
			err2[key] = err[key];
		}
		err2.message = err.message;
		err2.stack = (err.stack.match(/^(?:.*\n){1,6}/m) || emptyMatch)[0];
		this.json({ err: err2 });
	}

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
	}

	exports.listen = function () {
		app.listen(config.data.appPort);
		console.log('express: listening ' + config.data.appPort);
	};


	// for test

	var request = require('superagent').agent();
	var url = 'http://localhost:' + config.data.appPort;
	var methods = [ 'post', 'get', 'put', 'del' ];

	for (var i = 0; i < methods.length; i++) {
		var method = methods[i];
		exports[method] = (function (method) {
			return function () {
				arguments[0] = url + arguments[0];
				return request[method].apply(request, arguments);
			}
		})(method)
	}

	exports.resetSuperAgent = function () {
		request = require('superagent').agent();
	};

});
