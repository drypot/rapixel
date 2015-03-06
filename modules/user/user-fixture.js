var should = require('should');

var init = require('../base/init');
var userc = require('../user/user-create');
var express2 = require('../main/express');

init.add(function (done) {
  var forms = [
    { en:'user1', name: 'testuser', email: 'abc@def.com', password: '1234' },
    { en:'user2', name: 'testuser2', email: 'abc2@def.com', password: '1234' },
    { en:'user3', name: 'testuser3', email: 'abc3@def.com', password: '1234' },
    { en:'admin', name: 'testadmin', email: 'admin@def.com', password: '1234', admin: true }
  ];
  var i = 0;
  function create() {
    if (i == forms.length) return done();
    var form = forms[i++];
    userc.createUser(form, function (err, user) {
      should.not.exist(err);
      user.password = form.password;
      exports[form.en] = user;
      setImmediate(create);
    });
  }
  create();
});

exports.logout = function (done) {
  express2.del('/api/sessions', function (err, res) {
    should.not.exist(err);
    should.not.exist(res.error);
    should.not.exist(res.body.err);
    done();
  });
}

exports.loginUser1 = function (done) {
  var form = { email: exports.user1.email, password: exports.user1.password };
  express2.post('/api/sessions').send(form).end(function (err, res) {
    should.not.exist(err);
    should.not.exist(res.error);
    should.not.exist(res.body.err);
    done();
  });
};

exports.loginUser1WithRemember = function (done) {
  var form = { email: exports.user1.email, password: exports.user1.password, remember: true };
  express2.post('/api/sessions').send(form).end(function (err, res) {
    should.not.exist(err);
    should.not.exist(res.error);
    should.not.exist(res.body.err);
    done();
  });
};

exports.loginUser2 = function (done) {
  var form = { email: exports.user2.email, password: exports.user2.password };
  express2.post('/api/sessions').send(form).end(function (err, res) {
    should.not.exist(err);
    should.not.exist(res.error);
    should.not.exist(res.body.err);
    done();
  });
};

exports.loginUser3 = function (done) {
  var form = { email: exports.user3.email, password: exports.user3.password };
  express2.post('/api/sessions').send(form).end(function (err, res) {
    should.not.exist(err);
    should.not.exist(res.error);
    should.not.exist(res.body.err);
    done();
  });
};

exports.loginAdmin = function (done) {
  var form = { email: exports.admin.email , password: exports.admin.password };
  express2.post('/api/sessions').send(form).end(function (err, res) {
    should.not.exist(err);
    should.not.exist(res.error);
    should.not.exist(res.body.err);
    done();
  });
};
