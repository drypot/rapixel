var init = require('../base/init');
var express2 = require('../main/express');

init.add(function () {
  var app = express2.app;

  app.get('/company', function (req, res, done) {
    res.render('about/about-company');
  });

  app.get('/services', function (req, res, done) {
    res.render('about/about-services');
  });

  app.get('/privacy', function (req, res, done) {
    res.render('about/about-privacy');
  });

  app.get('/help', function (req, res, done) {
    res.render('about/about-help');
  });

  app.get('/support', function (req, res, done) {
    res.render('about/about-help');
  });
});
