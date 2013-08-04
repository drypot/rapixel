var init = require('../lang/init');
var config = require('../config/config');

function mkc(code, msg) {
	return {
		code: code,
		message: msg
	};
}

function mkf(field, msg) {
	return {
		field: field,
		message: msg
	};
}

module.exports = {
	INVALID_DATA: mkc(100, '비정상적인 값이 입력되었습니다.'),
	MULTIPLE: mkc(110, '*'),

	NOT_AUTHENTICATED: mkc(200, '먼저 로그인해 주십시오.'),
	NOT_AUTHORIZED: mkc(201, '사용 권한이 없습니다.'),
	USER_NOT_FOUND: mkc(202, '사용자를 찾을 수 없습니다.'),
	RESET_TIMEOUT: mkc(210, '비밀번호 초기화 토큰 유효시간이 지났습니다.'),

	IMAGE_NOT_EXIST: mkc(300, '파일이 없습니다.'),

	// user register

	NAME_EMPTY: mkf('name', '이름을 입력해 주십시오.'),
	NAME_RANGE: mkf('name', '이름 길이는 2 ~ 32 글자입니다.'),
	NAME_DUPE: mkf('name', '이미 등록되어 있는 이름입니다.'),

	HOME_EMPTY: mkf('home', '개인 주소를 입력해 주십시오.'),
	HOME_RANGE: mkf('home', '개인 주소 길이는 2 ~ 32 글자입니다.'),
	HOME_DUPE: mkf('home', '이미 등록되어 있는 개인 주소입니다.'),

	EMAIL_EMPTY: mkf('email', '이메일 주소를 입력해 주십시오.'),
	EMAIL_RANGE: mkf('email', '이메일 주소 길이는 8 ~ 64 글자입니다.'),
	EMAIL_PATTERN: mkf('email', '이메일 형식이 잘못되었습니다.'),
	EMAIL_DUPE: mkf('email', '이미 등록되어 있는 이메일입니다.'),

	PASSWORD_EMPTY: mkf('password', '비밀번호를 입력해 주십시오.'),
	PASSWORD_RANGE: mkf('password', '비밀번호 길이는 4 ~ 32 글자입니다.'),

	// user login

	EMAIL_NOT_FOUND: mkf('email', '등록되지 않은 이메일입니다.'),
	ACCOUNT_DEACTIVATED: mkf('email', '사용중지된 계정입니다.'),
	PASSWORD_WRONG: mkf('password', '비밀번호가 틀렸습니다.'),

	// image upload

	IMAGE_CYCLE: mkf('files', '이미지는 하루 한 장 등록하실 수 있습니다.'),
	IMAGE_NO_FILE: mkf('files', '아미지 파일이 첨부되지 않았습니다.'),
	IMAGE_SIZE: mkf('files', '이미지의 크기는 ' + config.minWidth + 'x' + config.minHeight + ' 픽셀 이상이어야 합니다.'),
	IMAGE_TYPE: mkf('files', '인식할 수 없는 파일입니다.'),

	// request reset

	EMAIL_NOT_EXIST: mkf('email', '등록되지 않은 이메일입니다.')
};
