var should = require('should');

var ecode = require('../main/ecode');

exports = module.exports = function (ec) {
	var err, key;
	if (Array.isArray(ec)) {
		err = new Error(ecode.ERRORS.message);
		err.rc = ecode.ERRORS.rc;
		err.errors = ec;
		return err;
	}
	if (ec.field) {
		err = new Error(ecode.ERRORS.message);
		err.rc = ecode.ERRORS.rc;
		err.errors = [ec];
		return err;
	}
	if (ec.rc) {
		err = new Error(ec.message);
		err.rc = ec.rc;
		return err;
	}
	err = new Error('unknown error');
	for (key in ec) {
		err[key] = ec[key];
	}
	return err;
};

exports.find = function (err, ec) {
	if (ec.field) {
		err.rc.should.equal(ecode.ERRORS.rc);
		should(err.errors);
		for (var i = 0; i < err.errors.length; i++) {
			var error = err.errors[i];
			if (error.field == ec.field && error.message == ec.message) {
				return true;
			}
		}
	} else if (ec.rc) {
		if (err.rc == ec.rc && err.message == ec.message) {
			return true;
		}
	}
	return false;
}
