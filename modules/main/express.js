var should = require('should');
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var redisStore = require('connect-redis')(session);

var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config');

var app;

init.add(function () {
  app = exports.app = express();

  // Set Middlewares

  app.disable('x-powered-by');
  app.locals.pretty = true;
  app.locals.appName = config.appName;
  app.locals.appDesc = config.appDesc;
  app.locals.appType = config.appType;

  app.engine('jade', require('jade').renderFile);
  app.set('view engine', 'jade');
  app.set('views', 'modules');

  app.use(cookieParser());
  app.use(session({ 
    store: new redisStore({ ttl: 1800 /* 단위: 초. 30 분 */ }), 
    resave: false,
    saveUninitialized: false,
    secret: config.cookieSecret
  }));
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  app.use(function (req, res, done) {
    res.locals.query = req.query;
    //res.locals.api = /^\/api\//.test(req.path); 
    //req.xhr
    if (req.is('json')) {
      // IE 는 웹페이지까지만 refresh 하고 ajax request 는 refresh 하지 않는다.  
      res.set('Cache-Control', 'no-cache');
    } else {
      // force web page cached.
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

});

init.addTail(function () {
  var emptyMatch = [''];  
  app.use(function (_err, req, res, done) {
    var err = {};
    for (var key in _err) {
      err[key] = _err[key];
    }
    err.message = _err.message;
    if (req.is('json')) {
      err.stack = (_err.stack.match(/^(?:.*\n){1,6}/m) || emptyMatch)[0];
      res.json({ err: err });
    } else {
      err.stack = (_err.stack.match(/^(?:.*\n){1,6}/m) || emptyMatch)[0].replace(/Error:.+\n/, '');
      res.render('main/error', { err: err });
    }
  });

  //app.use(errorHandler(/* {log: false} */));

  app.listen(config.appPort);
  console.log('express: listening ' + config.appPort);
});
