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
	if ('development' == app.get('env')) {
		app.locals.pretty = true;
	}

	app.locals.siteTitle = config.data.siteTitle;

	app.use(express.cookieParser(config.data.cookieSecret));

	if ('production' == app.get('env') || opt.store === 'redis') {
		app.use(express.session({ store: new redisStore() }));
		log += ' redis';
	} else {
		app.use(express.session());
		log += ' memory';
	}

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

	// solve IE ajax caching problem.
	app.all('/api/*', function (req, res, next) {
		res.set('Cache-Control', 'no-cache');
		next();
	});

	app.use(express.errorHandler());

	should.not.exist(app.request.user);
	app.request.user = function (next) {
		var req = this;
		var res = this.res;
		var u = res.locals.user;
		if (!u) {
			return next(error(error.NOT_AUTHENTICATED));
		}
		next(null, u);
	};

	should.not.exist(app.request.admin);
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

	var empty = {};

	should.not.exist(app.response.jsonEmpty);
	app.response.jsonEmpty = function (err) {
		this.json(empty);
	}

	var cut5LinesPattern = /^(?:.*\n){1,5}/m;
	var emptyMatch = [''];

	should.not.exist(app.response.jsonErr);
	app.response.jsonErr = function (err) {
		var err2 = {};
		for (var key in err) {
			err2[key] = err[key];
		}
		err2.message = err.message;
		err2.stack = (err.stack.match(cut5LinesPattern) || emptyMatch)[0];
		this.json({ err: err2 });
	}

	should.not.exist(app.response.renderErr);
	app.response.renderErr = function (err) {
		if (err.rc && err.rc == error.NOT_AUTHENTICATED) {
			this.redirect('/');
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
