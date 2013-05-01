
exports = module.exports = function (arg) {
	var err;
	if (typeof arg === 'number') {
		err = new Error(msg[arg]);
		err.rc = arg;
	} else if (typeof arg === 'string') {
		err = new Error(arg);
	} else if (typeof arg.rc === 'number') {
		err = new Error(msg[arg.rc]);
		for (var key in arg) {
			err[key] = arg[key];
		}
	} else {
		err = new Error('unknown error');
		for (var key in arg) {
			err[key] = arg[key];
		}
	}
	return err;
}

exports.NOT_AUTHENTICATED = 101;
exports.NOT_AUTHORIZED = 102;
exports.INVALID_PASSWORD = 103;

exports.INVALID_DATA = 201;
exports.INVALID_CATEGORY = 202;
exports.INVALID_THREAD = 203;
exports.INVALID_POST = 204;

var msg = exports.msg = {
	NAME_EMPTY: '이름을 입력해 주십시오.',
	NAME_RANGE: '이름 길이는 2 ~ 32 글자입니다.',
	NAME_DUPE: '이미 등록되어 있는 이름입니다.',

	EMAIL_EMPTY: '이메일 주소를 입력해 주십시오.',
	EMAIL_RANGE: '이메일 주소 길이는 8 ~ 64 글자입니다.',
	EMAIL_PATTERN: '이메일 주소 모양이 이상합니다.',
	EMAIL_DUPE: '이미 등록되어 있는 이메일입니다.',

	PASSWORD_EMPTY: '비밀번호를 입력해 주십시오.',
	PASSWORD_RANGE: '비밀번호 길이는 4 ~ 32 글자입니다.'

};

msg[exports.NOT_AUTHENTICATED] = '먼저 로그인해 주십시오.';
msg[exports.NOT_AUTHORIZED] = '사용 권한이 없습니다.';
msg[exports.INVALID_PASSWORD] = '이메일이나 비밀번호를 다시 확인해 주십시오.';

msg[exports.INVALID_DATA] = '비정상적인 값이 입력되었습니다.';
msg[exports.INVALID_CATEGORY] = '정상적인 카테고리가 아닙니다.';
msg[exports.INVALID_THREAD] = '정상적인 글줄이 아닙니다.';
msg[exports.INVALID_POST] = '정상적인 글이 아닙니다.';
