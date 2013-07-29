var error = require('../error/error');
var ecode = require('../error/ecode');


	exports.findUserByEmail = function (email, next) {
		users.findOne({ email: email }, next);
	};


	exports.updateUserAdate = function (id, now, next) {
		users.update({ _id: id }, { $set: { adate: now } }, next);
	};


	exports.validatePassword = function (password, hash) {
		return bcrypt.compareSync(password, hash);
	}

