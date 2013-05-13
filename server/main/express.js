var should = require('should');
var express = require('express');
var redisStore = require('connect-redis')(express);

var init = require('../main/init');
var config = require('../main/config');
var user = require('../main/user');
var upload = require('../main/upload');
var error = require('../main/error');

var opt = {};

exports = module.exports = function (_opt) {
	for(var p in _opt) {
		opt[p] = _opt[p];
	}
	return exports;
};

init.add(function () {

	var app = exports.app = express();
	var log = 'express:';

	app.disable('x-powered-by');

	app.engine('jade', require('jade').renderFile);
	app.set('view engine', 'jade'); // default view engine
	app.set('views', process.cwd() + '/client/jade'); // view root
	app.locals.pretty = true;

	app.locals.siteTitle = config.data.siteTitle;

	app.use(express.cookieParser(config.data.cookieSecret));

	app.use(express.session({ store: new redisStore({ ttl: 1800 /* 단위: 초. 30 분 */ }) }));
	log += ' redis';

//	app.use(express.session());
//	log += ' memory';

	app.use(express.bodyParser({ uploadDir: upload.tmp }));

	app.use(function (req, res, next) {
		if (req.session.userId) {
			user.cachedUser(req.session.userId, function (err, u) {
				if (err) return next(err);
				res.locals.user = u;
				next();
			});
			return;
		}
		next();
	});

	app.use(app.router);

	var apiPath = /^\/api\//;
	app.all('*', function (req, res, next) {
		if (apiPath.test(req.path)) {
			// solve IE ajax caching problem.
			res.set('Cache-Control', 'no-cache');
		} else {
			// force web pages cacehd.
			res.set('Cache-Control', 'private');
		}
		next();
	});

	app.use(express.errorHandler());

	app.request.user = function (next) {
		var req = this;
		var res = this.res;
		var u = res.locals.user;
		if (!u) {
			return next(error(error.NOT_AUTHENTICATED));
		}
		next(null, u);
	};

	app.request.admin = function (next) {
		var req = this;
		var res = this.res;
		var u = res.locals.user;
		if (!u) {
			return next(error(error.NOT_AUTHENTICATED));
		}
		if (!u.admin) {
			return next(error(error.NOT_AUTHORIZED));
		}
		next(null, u);
	};

	var cut5LinesPattern = /^(?:.*\n){1,5}/m;
	var emptyMatch = [''];

	app.response.safeJson = function (obj) {
		// IE9 + ajaxForm + multipart/form-data 사용할 경우 application/json 으로 리턴하면 저장하려든다.
		//console.log(this.req.headers);
		var accept = this.req.get('accept');
		if (accept && accept.indexOf('text/html') != -1) {
			this.send(JSON.stringify(obj));
		} else {
			this.json(obj);
		}
	};

	app.response.jsonErr = function (err) {
		var err2 = {};
		for (var key in err) {
			err2[key] = err[key];
		}
		err2.message = err.message;
		err2.stack = (err.stack.match(cut5LinesPattern) || emptyMatch)[0];
		this.safeJson({ err: err2 });
	}

	app.response.renderErr = function (err) {
		if (err.rc && err.rc == error.NOT_AUTHENTICATED) {
			this.redirect('/users/login');
			return;
		}
		var err2 = {};
		for (var key in err) {
			err2[key] = err[key];
		}
		err2.message = err.message;
		err2.stack = err.stack;
		this.render('error', { err: err2 });
	}

	exports.listen = function () {
		app.listen(config.data.port);
		log += ' ' + config.data.port;
		console.log(log);
	};

	// for test

	var request = require('superagent').agent();
	var url = 'http://localhost:' + config.data.port;
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

});
