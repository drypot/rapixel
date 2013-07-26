var nodemailer = require("nodemailer");

var init = require('../lang/init');
var config = require('../config/config');

init.add(function () {

	var transport;

	if (config.data.mailServer) {
		transport = nodemailer.createTransport("SMTP", {
			host: config.data.mailServer,
			port: 25
		});
	}

	exports.send = function (opt, next) {
		if (transport) {
			return transport.sendMail(opt, next);
		}
		console.log(opt);
		next();
	};

});

