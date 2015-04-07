var expect = require('chai').expect;
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var redisStore = require('connect-redis')(session);

var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config');
var exp = exports;

exp.core = express.Router();

init.add(function () {
  exp.app = express();

  // Set Middlewares

  exp.app.disable('x-powered-by');
  exp.app.locals.pretty = true;
  exp.app.locals.appName = config.appName;
  exp.app.locals.appDesc = config.appDesc;
  exp.app.locals.appType = config.appType;

  exp.app.engine('jade', require('jade').renderFile);
  exp.app.set('view engine', 'jade');
  exp.app.set('views', 'modules');

  exp.app.use(cookieParser());
  exp.app.use(session({ 
    store: new redisStore({ ttl: 1800 /* 단위: 초. 30 분 */ }), 
    resave: false,
    saveUninitialized: false,
    secret: config.cookieSecret
  }));
  exp.app.use(bodyParser.urlencoded({ extended: false }));
  exp.app.use(bodyParser.json());

  exp.app.use(function (req, res, done) {
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

  // exp.before: 인증 미들웨어용
  // exp.after: redirect to login page 용
  // 테스트케이스에서 인스턴스가 기동한 후 핸들러를 추가하는 경우가 있어 core 를 도입.

  if (exp.autoLogin) {
    exp.app.use(exp.autoLogin);
  }

  exp.app.use(exp.core);

  exp.app.get('/api/hello', function (req, res, done) {
    res.json({
      name: config.appName,
      time: Date.now()
    });
  });

  exp.app.all('/api/echo', function (req, res, done) {
    res.json({
      method: req.method,
      rtype: req.header('content-type'),
      query: req.query,
      body: req.body
    });
  });

  exp.app.get('/test/error', function (req, res, done) {
    var err = new Error('Error Sample Page');
    err.code = 999;
    res.render('express/error', {
      err: err
    });
  });

  exp.core.post('/api/test/destroy-session', function (req, res, done) {
    req.session.destroy();
    res.json({});
  });

  exp.core.get('/api/test/cookies', function (req, res, done) {
    res.json(req.cookies);
  });

  // error handler

  if (exp.redirectToLogin) {
    exp.app.use(exp.redirectToLogin);
  }

  exp.app.use(function (_err, req, res, done) {
    var err = {
      message: _err.message,
      code: _err.code,
      errors: _err.errors,
    };
    err.stack = ((_err.stack || '').match(/^(?:.*\n){1,8}/m) || [''])[0];
    if (exp.logError) {
      console.error('Code: ' + err.code);
      console.error(err.stack);
    }
    if (res.locals.api) {
      res.json({ err: err });
    } else {
      res.render('express/error', { err: err });
    }
  });

});

init.tail(function () {
  exp.app.listen(config.appPort);
  console.log('express: listening ' + config.appPort);
});
