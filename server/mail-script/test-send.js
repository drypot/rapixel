var nodemailer = require('nodemailer');

var transport = nodemailer.createTransport();

var mail = {
  from: 'no-reply@raysoda.com',
  to: 'drypot@gmail.com',
  subject: 'expl mail server test from ' + require('os').hostname(),
  text: 'Hello'
};

transport.sendMail(mail, function (err) {
  console.log(err ? 'err' : 'success');
});
