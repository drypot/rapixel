var init = require('../base/init');
var error = require('../base/error');
var express2 = require('../main/express');
var userb = require('../user/user-base');

init.add(function () {
  var app = express2.app;

  app.get('/api/users/:id([0-9]+)', function (req, res) {
    var id = parseInt(req.params.id) || 0;
    var user = res.locals.user
    exports.getCached(id, function (err, _tuser) {
      if (err) return res.jsonErr(err);
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

var users = [];
var usersByHome = {};

function cache(user) {
  users[user._id] = user;
  usersByHome[user.homel] = user;
}

exports.deleteCache = function (id) {
  var user = users[id];
  if (user) {
    delete users[id];
    delete usersByHome[user.homel];
  }
}

exports.getCached = function (id, done) {
  var user = users[id];
  if (user) {
    return done(null, user);
  }
  userb.users.findOne({ _id: id }, function (err, user) {
    if (err) return done(err);
    if (!user) return done(error(error.USER_NOT_FOUND));
    cache(user);
    done(null, user);
  });
};

exports.getCachedByHome = function (homel, done) {
  var user = usersByHome[homel];
  if (user) {
    return done(null, user);
  }
  userb.users.findOne({ homel: homel }, function (err, user) {
    if (err) return done(err);
    if (!user) {
      // 사용자 프로필 URL 검색에 주로 사용되므로 error 생성은 패스한다.
      return done();
    }
    cache(user);
    done(null, user);
  });
};

exports.findAndCache = function (email, done) {
  userb.users.findOne({ email: email }, function (err, user) {
    if (err) return done(err);
    if (!user) {
      return done();
    }
    cache(user);
    done(null, user);
  });
};
