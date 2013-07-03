
function mke(rc, msg) {
	return {
		rc: rc,
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

	INVALID_DATA: mke(100, '비정상적인 값이 입력되었습니다.'),
	ERRORS: mke(110, '*'),

	NOT_AUTHENTICATED: mke(200, '먼저 로그인해 주십시오.'),
	NOT_AUTHORIZED: mke(201, '사용 권한이 없습니다.'),
	USER_NOT_FOUND: mke(202, '사용자를 찾을 수 없습니다.'),
	RESET_TIMEOUT: mke(210, '비밀번호 초기화 토큰 유효시간이 지났습니다.'),

	PHOTO_NOT_EXIST: mke(300, '사진이 없습니다.'),

	// register & edit

	NAME_EMPTY: mkf('name', '이름을 입력해 주십시오.'),
	NAME_RANGE: mkf('name', '이름 길이는 2 ~ 32 글자입니다.'),
	NAME_DUPE: mkf('name', '이미 등록되어 있는 이름입니다.'),

	EMAIL_EMPTY: mkf('email', '이메일 주소를 입력해 주십시오.'),
	EMAIL_RANGE: mkf('email', '이메일 주소 길이는 8 ~ 64 글자입니다.'),
	EMAIL_PATTERN: mkf('email', '이메일 형식이 잘못되었습니다.'),
	EMAIL_DUPE: mkf('email', '이미 등록되어 있는 이메일입니다.'),

	PASSWORD_EMPTY: mkf('password', '비밀번호를 입력해 주십시오.'),
	PASSWORD_RANGE: mkf('password', '비밀번호 길이는 4 ~ 32 글자입니다.'),

	// login

	EMAIL_NOT_FOUND: mkf('email', '등록되지 않은 이메일입니다.'),
	ACCOUNT_DEACTIVATED: mkf('email', '사용중지된 계정입니다.'),
	PASSWORD_WRONG: mkf('password', '비밀번호가 틀렸습니다.'),

	// upload photo

	PHOTO_CYCLE: mkf('files', '사진은 하루 한 장 등록하실 수 있습니다.'),
	PHOTO_NO_FILE: mkf('files', '사진을 첨부해 주십시오.'),
	PHOTO_RATIO: mkf('files', '사진의 가로 세로 비율은 16:9 여야합니다.'),
	PHOTO_SIZE: mkf('files', '사진의 가로 크기는 3840 픽셀 이상이어야 합니다.'),
	PHOTO_TYPE: mkf('files', '사진 파일 타입을 확인할 수 없습니다.'),

	// request reset

	EMAIL_NOT_EXIST: mkf('email', '등록되지 않은 이메일입니다.')

};
