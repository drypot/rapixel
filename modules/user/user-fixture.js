var expect = require('chai').expect;

var init = require('../base/init');
var userb = require('../user/user-base');
var usera = require('../user/user-auth');
var userc = require('../user/user-create');
var local = require('../main/local');

init.add(exports.recreate = function (done) {
  var forms = [
    { name: 'user1', email: 'user1@mail.com', password: '1234' },
    { name: 'user2', email: 'user2@mail.com', password: '1234' },
    { name: 'user3', email: 'user3@mail.com', password: '1234' },
    { name: 'admin', email: 'admin@mail.com', password: '1234', admin: true }
  ];
  var i = 0;
  function create() {
    if (i == forms.length) return done();
    var form = forms[i++];
    userc.createUser(form, function (err, user) {
      expect(err).not.exist;
      user.password = form.password;
      exports[form.name] = user;
      setImmediate(create);
    });
  }
  usera.resetCache();
  userb.users.remove(function (err) {
    if (err) return done(err);
    create();
  });
});

exports.login = function (name, remember, done) {
  var remember;
  if (arguments.length == 2) {
    done = remember;
    remember = false;
  }
  var user = exports[name];
  var form = { email: user.email, password: user.password, remember: remember };
  local.post('/api/session').send(form).end(done);
};

exports.logout = function (done) {
  local.del('/api/session', done);
}
