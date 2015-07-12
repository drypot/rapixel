var nodemailer = require('nodemailer');

var init = require('../base/init');
var config = require('../base/config');
var mailer = exports;

var transport;

init.add(function () {
  
  // 일단은 postfix 통해서 메일 보내는 것으로 유지

  // To Do: 메일 발송 테스트를 위해 구글 계정을 사용하는 코드를 추가

  if (config.mailServer) {
    transport = nodemailer.createTransport({
      host: config.mailServer,
      port: 25
    });
  }
});

mailer.send = function (opt, done) {
  if (transport) {
    return transport.sendMail(opt, done);
  }
  console.log(opt);
  done();
};
