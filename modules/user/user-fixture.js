var init = require('../base/init');
var userb = require('../user/user-base');
var local = require('../express/local');
var expect = require('../base/assert').expect;
var userf = exports;

init.add(exports.recreate = function (done) {
  userb.resetCache();
  userb.users.deleteMany(function (err) {
    if (err) return done(err);
    var forms = [
      { name: 'user1', email: 'user1@mail.com', password: '1234' },
      { name: 'user2', email: 'user2@mail.com', password: '1234' },
      { name: 'user3', email: 'user3@mail.com', password: '1234' },
      { name: 'admin', email: 'admin@mail.com', password: '1234', admin: true }
    ];
    var i = 0;
    (function create() {
      if (i < forms.length) {
        var form = forms[i++];
        var now = new Date();
        var user = {
          _id: userb.getNewId(),
          name: form.name,
          namel: form.name,
          home: form.name,
          homel: form.name,
          email: form.email,
          hash: userb.makeHash(form.password),
          status: 'v',
          cdate: now,
          adate: now,
          profile: '',
        };
        if (form.admin) {
          user.admin = true;
        }
        userb.users.insertOne(user, function (err) {
          expect(err).not.exist;
          user.password = form.password;
          exports[user.name] = user;
          setImmediate(create);
        });
        return;        
      }
      done();
    })();
  });
});

userf.login = function (name, remember, done) {
  if (typeof remember == 'function') {
    done = remember;
    remember = false;
  }
  var user = exports[name];
  var form = { email: user.email, password: user.password, remember: remember };
  local.post('/api/users/login').send(form).end(done);
};

userf.logout = function (done) {
  local.post('/api/users/logout', done);
}
