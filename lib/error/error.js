var should = require('should');

var init = require('../lang/init');

var error = exports = module.exports = function (obj) {
	var err;
	if (Array.isArray(obj)) {
		err = new Error(error.ids.MULTIPLE.message);
		err.code = error.ids.MULTIPLE.code;
		err.errors = obj;
		return err;
	}
	if (obj.field) {
		err = new Error(error.ids.MULTIPLE.message);
		err.code = error.ids.MULTIPLE.code;
		err.errors = [obj];
		return err;
	}
	if (obj.code) {
		err = new Error(obj.message);
		err.code = obj.code;
		return err;
	}
	err = new Error('unknown error');
	for (var p in obj) {
		err[p] = obj[p];
	}
	return err;
};

init.add(function () {
	error.ids = require('./error-ids');
});

error.find = function (err, ec) {
	if (ec.field) {
		err.code.should.equal(error.ids.MULTIPLE.code);
		should(err.errors);
		for (var i = 0; i < err.errors.length; i++) {
			var e = err.errors[i];
			if (e.field == ec.field && e.message == ec.message) {
				return true;
			}
		}
	} else if (ec.code) {
		if (err.code == ec.code && err.message == ec.message) {
			return true;
		}
	}
	return false;
}
