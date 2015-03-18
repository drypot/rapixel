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
    
    // Response 의 Content-Type 을 지정할 방법을 마련해 두어야한다.
    // 각 핸들러에서 res.send(), res.json() 으로 Content-Type 을 간접적으로 명시할 수도 있지만
    // 에러 핸들러는 공용으로 사용하기 때문에 이 방식에 의존할 수 없다.
    // 
    // req.xhr: 
    //   node + superagent 로 테스트할 시에는 Fail.
    //
    // req.is('json'): 
    //   superagent 로 GET 할 경우 매번 type('json') 을 명시해야하며 
    //   그렇게 한다 하여도 Content-Length: 0 인 GET 을 type-is 가 제대로 처리하지 못하고 null 을 리턴한다. Fail.
    //
    // 위와 같이 클라이언트에서 보내주는 정보에 의존하는 것은 불안정하다.
    // 해서 /api/* 로 들어오는 Request 에 대한 에러 Content-Type 은 일괄 json 으로 한다.
    // json 이외의 결과 타입을 원하는 클라이언트에서도 json 타입 에러를 처리하는 것은 크게 어려워보이지 않는다.

    res.locals.api = /^\/api\//.test(req.path);  
    if (res.locals.api) {
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
    var err = {
      message: _err.message,
      code: _err.code,
      errors: _err.errors,
      stack: _err.stack
    };
    // console.log('..........');
    // console.dir(_err);
    // console.log('..........');
    if (res.locals.api) {
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
