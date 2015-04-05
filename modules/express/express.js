var expect = require('chai').expect;
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

  // 보통 init.add + init.tail 로 핸들러 구성 순서를 조율할 수 있으나
  // 인증 미들웨어는 앞 부분에 위치할 필요가 있어 별로 라우터를 설치해 놓는다.
  // user/user-auth.js 참고
  //
  // 테스트케이스에서 인스턴스가 기동한 후 핸들러를 추가하는 경우가 있어 core 를 도입.

  app.use(exports.before = express.Router());
  app.use(exports.core = express.Router());
});

init.tail(function () {
  app.get('/api/hello', function (req, res, done) {
    res.json({
      name: config.appName,
      time: Date.now()
    });
  });

  app.all('/api/echo', function (req, res, done) {
    res.json({
      method: req.method,
      rtype: req.header('content-type'),
      query: req.query,
      body: req.body
    });
  });

  app.get('/dev/error', function (req, res, done) {
    var err = new Error('Error Sample Page');
    err.code = 999;
    res.render('express/error', {
      err: err
    });
  });

  /* error handler */
  app.use(function (_err, req, res, done) {
    var err = {
      message: _err.message,
      code: _err.code,
      errors: _err.errors,
    };
    err.stack = ((_err.stack || '').match(/^(?:.*\n){1,8}/m) || [''])[0];
    if (exports.logError) {
      console.error('Code: ' + err.code);
      console.error(err.stack);
    }
    if (res.locals.api) {
      res.json({ err: err });
    } else {
      res.render('express/error', { err: err });
    }
  });

  //app.use(errorHandler(/* {log: false} */));

  app.listen(config.appPort);
  console.log('express: listening ' + config.appPort);
});
