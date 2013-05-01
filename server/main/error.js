
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
	FILL_TITLE: '제목을 입력해 주십시오.',
	SHORTEN_TITLE: '제목을 줄여 주십시오.',
	FILL_WRITER: '필명을 입력해 주십시오.',
	SHORTEN_WRITER: '필명을 줄여 주십시오.'
};

msg[exports.NOT_AUTHENTICATED] = '먼저 로그인 해주십시오.';
msg[exports.NOT_AUTHORIZED] = '사용 권한이 없습니다.';
msg[exports.INVALID_PASSWORD] = '비밀번호를 다시 확인해 주십시오.';

msg[exports.INVALID_DATA] = '비정상적인 값이 입력되었습니다.';
msg[exports.INVALID_CATEGORY] = '정상적인 카테고리가 아닙니다.';
msg[exports.INVALID_THREAD] = '정상적인 글줄이 아닙니다.';
msg[exports.INVALID_POST] = '정상적인 글이 아닙니다.';
