
exports = module.exports = function (arg, arg2) {
	var err, key;
	if (arg instanceof Errors) {
		err = new Error(msg[exports.ERROR_SET]);
		err.rc = exports.ERROR_SET;
		err.errors = arg.errors;
		return err;
	}
	if (arg2) {
		err = new Error(msg[exports.ERROR_SET]);
		err.rc = exports.ERROR_SET;
		err.errors = [{ name: arg, msg: arg2 }];
		return err;
	}
	if (typeof arg === 'number') {
		err = new Error(msg[arg]);
		err.rc = arg;
		return err;
	}
	if (typeof arg === 'string') {
		err = new Error(arg);
		return err;
	}
	err = new Error('unknown error');
	for (key in arg) {
		err[key] = arg[key];
	}
	return err;
};

var Errors = exports.Errors = function () {
	this.errors = [];
};

Errors.prototype.add = function (name, msg) {
	this.errors.push({ name: name, msg: msg });
};

Errors.prototype.hasErrors = function () {
	return this.errors.length > 0;
};


exports.ERROR_SET = 10;

exports.NOT_AUTHENTICATED = 101;
exports.NOT_AUTHORIZED = 102;

exports.INVALID_DATA = 201;


var msg = exports.msg = {};

msg[exports.ERROR_SET] = '*';

msg[exports.NOT_AUTHENTICATED] = '먼저 로그인해 주십시오.';
msg[exports.NOT_AUTHORIZED] = '사용 권한이 없습니다.';

msg[exports.INVALID_DATA] = '비정상적인 값이 입력되었습니다.';

msg.NAME_EMPTY = '이름을 입력해 주십시오.';
msg.NAME_RANGE = '이름 길이는 2 ~ 32 글자입니다.';
msg.NAME_DUPE = '이미 등록되어 있는 이름입니다.';

msg.EMAIL_EMPTY = '이메일 주소를 입력해 주십시오.';
msg.EMAIL_RANGE = '이메일 주소 길이는 8 ~ 64 글자입니다.';
msg.EMAIL_PATTERN = '이메일 주소가 맞는지 다시 한번 확인해 주십시오.';
msg.EMAIL_DUPE = '이미 등록되어 있는 이메일입니다.';

msg.PASSWORD_EMPTY = '비밀번호를 입력해 주십시오.';
msg.PASSWORD_RANGE = '비밀번호 길이는 4 ~ 32 글자입니다.'

msg.USER_NOT_FOUND = '사용자 정보를 찾을 수 없습니다.';

msg.PHOTO_CYCLE = '사진은 하루 한 장 등록하실 수 있습니다.';
msg.PHOTO_NO_FILE = '사진을 첨부해 주십시오.';
msg.PHOTO_NOT_ONE = '사진은 한장만 등록하실 수 있습니다.';
msg.PHOTO_RATIO = '사진의 가로 세로 비율은 16:9 여야합니다.';
msg.PHOTO_HEIGHT = '사진의 세로 크기는 2160 픽셀 이상이어야 합니다.';
msg.PHOTO_TYPE = '사진 파일 타입을 확인할 수 없습니다.';
msg.PHOTO_NOTHING_TO_DEL = '삭제할 사진이 없습니다.';
msg.PHOTO_NOTHING_TO_SHOW = '사진이 없습니다.';
