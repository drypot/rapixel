var init = require('../base/init');
var expb = require('../express/express-base');

init.add(function () {
  expb.core.get('/about/site', function (req, res, done) {
    res.render('about/about-site');
  });

  expb.core.get('/about/company', function (req, res, done) {
    res.render('about/about-company');
  });

  expb.core.get('/about/privacy', function (req, res, done) {
    res.render('about/about-privacy');
  });

  expb.core.get('/about/help', function (req, res, done) {
    res.render('about/about-help');
  });

  expb.core.get('/about/support', function (req, res, done) {
    res.render('about/about-help');
  });
});
