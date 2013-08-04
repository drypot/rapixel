var nodemailer = require("nodemailer");

var init = require('../lang/init');
var config = require('../config/config');

var transport;

init.add(function () {
	if (config.mailServer) {
		transport = nodemailer.createTransport("SMTP", {
			host: config.mailServer,
			port: 25
		});
	}
});

exports.send = function (opt, next) {
	if (transport) {
		return transport.sendMail(opt, next);
	}
	console.log(opt);
	next();
};

