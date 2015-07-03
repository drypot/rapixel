var init = require('../base/init');
var exp = require('../express/express');

init.add(function () {
  exp.core.get('/about/company', function (req, res, done) {
    res.render('about/about-company');
  });

  exp.core.get('/about/privacy', function (req, res, done) {
    res.render('about/about-privacy');
  });

  exp.core.get('/about/help', function (req, res, done) {
    res.render('about/about-help');
  });

  exp.core.get('/about/support', function (req, res, done) {
    res.render('about/about-help');
  });
});
