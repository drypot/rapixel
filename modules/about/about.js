var init = require('../base/init');
var exp = require('../express/express');

init.add(function () {
  exp.core.get('/company', function (req, res, done) {
    res.render('about/about-company');
  });

  exp.core.get('/services', function (req, res, done) {
    res.render('about/about-services');
  });

  exp.core.get('/privacy', function (req, res, done) {
    res.render('about/about-privacy');
  });

  exp.core.get('/help', function (req, res, done) {
    res.render('about/about-help');
  });

  exp.core.get('/support', function (req, res, done) {
    res.render('about/about-help');
  });
});
