var init = require('../base/init');
var express2 = require('../main/express');

init.add(function () {
  var core = express2.core;

  core.get('/company', function (req, res, done) {
    res.render('about/about-company');
  });

  core.get('/services', function (req, res, done) {
    res.render('about/about-services');
  });

  core.get('/privacy', function (req, res, done) {
    res.render('about/about-privacy');
  });

  core.get('/help', function (req, res, done) {
    res.render('about/about-help');
  });

  core.get('/support', function (req, res, done) {
    res.render('about/about-help');
  });
});
