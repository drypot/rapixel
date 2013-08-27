var init = require('../lang/init');
var error = require('../error/error');
var fs2 = require('../fs/fs');
var config = require('../config/config');
var mongo = require('../mongo/mongo');

init.add(function () {
	error.define('NOT_AUTHENTICATED', '먼저 로그인해 주십시오.');
	error.define('NOT_AUTHORIZED', '사용 권한이 없습니다.');
	error.define('USER_NOT_FOUND', '사용자를 찾을 수 없습니다.');
	error.define('RESET_TIMEOUT', '비밀번호 초기화 토큰 유효시간이 지났습니다.');

	// user register

	error.define('NAME_EMPTY', 'name', '이름을 입력해 주십시오.');
	error.define('NAME_RANGE', 'name', '이름 길이는 2 ~ 32 글자입니다.');
	error.define('NAME_DUPE', 'name', '이미 등록되어 있는 이름입니다.');

	error.define('HOME_EMPTY', 'home', '개인 주소를 입력해 주십시오.');
	error.define('HOME_RANGE', 'home', '개인 주소 길이는 2 ~ 32 글자입니다.');
	error.define('HOME_DUPE', 'home', '이미 등록되어 있는 개인 주소입니다.');

	error.define('EMAIL_EMPTY', 'email', '이메일 주소를 입력해 주십시오.');
	error.define('EMAIL_RANGE', 'email', '이메일 주소 길이는 8 ~ 64 글자입니다.');
	error.define('EMAIL_PATTERN', 'email', '이메일 형식이 잘못되었습니다.');
	error.define('EMAIL_DUPE', 'email', '이미 등록되어 있는 이메일입니다.');

	error.define('PASSWORD_EMPTY', 'password', '비밀번호를 입력해 주십시오.');
	error.define('PASSWORD_RANGE', 'password', '비밀번호 길이는 4 ~ 32 글자입니다.');

	// user login

	error.define('EMAIL_NOT_FOUND', 'email', '등록되지 않은 이메일입니다.');
	error.define('ACCOUNT_DEACTIVATED', 'email', '사용중지된 계정입니다.');
	error.define('PASSWORD_WRONG', 'password', '비밀번호가 틀렸습니다.');

	// request reset

	error.define('EMAIL_NOT_EXIST', 'email', '등록되지 않은 이메일입니다.');
});

init.add(function (next) {
	var users = exports.users = mongo.db.collection("users");

	users.ensureIndex({ email: 1 }, function (err) {
		if (err) return next(err);
		users.ensureIndex({ namel: 1 }, function (err) {
			if (err) return next(err);
			users.ensureIndex({ homel: 1 }, next);
		});
	});
});

init.add(function (next) {
	exports.resets = mongo.db.collection("resets");
	exports.resets.ensureIndex({ email: 1 }, next);
});

