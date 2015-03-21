var init = require('../base/init');
var error = require('../base/error');
var express2 = require('../main/express');
var userb = require('../user/user-base');
var usera = require('../user/user-auth');

init.add(function () {
  var core = express2.core;

  core.get('/api/users/:id([0-9]+)', function (req, res, done) {
    var id = parseInt(req.params.id) || 0;
    var user = res.locals.user
    usera.getCached(id, function (err, _tuser) {
      if (err) return done(err);
      var tuser;
      if (user && user.admin) {
        tuser = {
          _id: _tuser._id,
          name: _tuser.name,
          home: _tuser.home,
          email: _tuser.email,
          status: _tuser.status,
          cdate: _tuser.cdate.getTime(),
          adate: _tuser.adate.getTime(),
          profile: _tuser.profile
        };
      } else if (user && user._id == _tuser._id) {
        tuser = {
          _id: _tuser._id,
          name: _tuser.name,
          home: _tuser.home,
          email: _tuser.email,
          status: _tuser.status,
          cdate: _tuser.cdate.getTime(),
          adate: _tuser.adate.getTime(),
          profile: _tuser.profile
        };
      } else {
        tuser = {
          _id: _tuser._id,
          name: _tuser.name,
          home: _tuser.home,
          //email: _tuser.email,
          status: _tuser.status,
          cdate: _tuser.cdate.getTime(),
          //adate: _tuser.adate.getTime(),
          profile: _tuser.profile
        };
      }
      res.json({
        user: tuser
      });
    });
  });
});

