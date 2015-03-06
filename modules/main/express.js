var should = require('should');
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var redisStore = require('connect-redis')(session);
var multipart = require('connect-multiparty');
var errorHandler = require('errorhandler');


var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config');

init.add(function () {
  var app = exports.app = express();

  // Set Middlewares

  app.disable('x-powered-by');
  app.locals.pretty = true;
  app.locals.appName = config.appName;
  app.locals.appDesc = config.appDesc;
  app.locals.appType = config.appType;

  app.engine('jade', require('jade').renderFile);
  app.set('view engine', 'jade');
  app.set('views', 'lib');

  app.use(cookieParser());
  app.use(session({ 
    store: new redisStore({ ttl: 1800 /* 단위: 초. 30 분 */ }), 
    resave: false,
    saveUninitialized: false,
    secret: config.cookieSecret
  }));
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(multipart({ uploadDir: config.uploadDir + '/tmp' }));

  app.use(function (req, res, done) {
    res.locals.query = req.query;
    if (res.locals.api = /^\/api\//.test(req.path)) {
      // solve IE ajax caching problem.
      res.set('Cache-Control', 'no-cache');
    } else {
      // force web page cacehd.
      res.set('Cache-Control', 'private');
    }
    done();
  });

  if (exports.restoreLocalsUser) {
    app.use(exports.restoreLocalsUser);
  }

  app.get('/api/hello', function (req, res) {
    res.json({
      name: config.appName,
      time: Date.now()
    });
  });

  app.get('/error', function (req, res) {
    var err = new Error('Error Sample Page');
    err.code = 999;
    res.render('main/error', {
      err: err
    });
  });

  should.not.exist(app.listen2);
  app.listen2 = function () {
    app.use(errorHandler());
    app.listen(config.appPort);
    console.log('express: listening ' + config.appPort);
  };
});

// Error Util

var emptyMatch = [''];

should.not.exist(express.response.jsonErr);
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

should.not.exist(express.response.renderErr);
express.response.renderErr = function (_err) {
  var res = this;
  if (_err.code && _err.code == error.NOT_AUTHENTICATED.code) {
    res.redirect('/users/login');
    return;
  }
  var err = {};
  for (var key in _err) {
    err[key] = _err[key];
  }
  err.message = _err.message;
  err.stack = (_err.stack.match(/^(?:.*\n){1,6}/m) || emptyMatch)[0].replace(/Error:.+\n/, '');
  res.render('main/error', { err: err });
};

