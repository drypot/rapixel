
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

exports.ERROR_SET = mke(10, '*');

exports.NOT_AUTHENTICATED = mke(101, '먼저 로그인해 주십시오.');
exports.NOT_AUTHORIZED = mke(102, '사용 권한이 없습니다.');
exports.USER_NOT_FOUND = mke(103, '사용자를 찾을 수 없습니다.');

exports.INVALID_DATA = mke(201, '비정상적인 값이 입력되었습니다.');

exports.PHOTO_NOTHING_TO_SHOW = mke(301, '사진이 없습니다.');
exports.PHOTO_NOTHING_TO_DEL = mke(302, '삭제할 사진이 없습니다.');


exports.fields = {};

// register & edit

exports.fields.NAME_EMPTY = mkf('name', '이름을 입력해 주십시오.');
exports.fields.NAME_RANGE = mkf('name', '이름 길이는 2 ~ 32 글자입니다.');
exports.fields.NAME_DUPE = mkf('name', '이미 등록되어 있는 이름입니다.');

exports.fields.EMAIL_EMPTY = mkf('email', '이메일 주소를 입력해 주십시오.');
exports.fields.EMAIL_RANGE = mkf('email', '이메일 주소 길이는 8 ~ 64 글자입니다.');
exports.fields.EMAIL_PATTERN = mkf('email', '이메일 주소가 맞는지 다시 한번 확인해 주십시오.');
exports.fields.EMAIL_DUPE = mkf('email', '이미 등록되어 있는 이메일입니다.');

exports.fields.PASSWORD_EMPTY = mkf('password', '비밀번호를 입력해 주십시오.');
exports.fields.PASSWORD_RANGE = mkf('password', '비밀번호 길이는 4 ~ 32 글자입니다.');

// login

exports.fields.USER_NOT_FOUND = mkf('email', '사용자를 찾을 수 없습니다.');

// upload photo

exports.fields.PHOTO_CYCLE = mkf('files', '사진은 하루 한 장 등록하실 수 있습니다.');
exports.fields.PHOTO_NO_FILE = mkf('files', '사진을 첨부해 주십시오.');
exports.fields.PHOTO_NOT_ONE = mkf('files', '사진은 한장만 등록하실 수 있습니다.');
exports.fields.PHOTO_RATIO = mkf('files', '사진의 가로 세로 비율은 16:9 여야합니다.');
exports.fields.PHOTO_HEIGHT = mkf('files', '사진의 세로 크기는 2160 픽셀 이상이어야 합니다.');
exports.fields.PHOTO_TYPE = mkf('files', '사진 파일 타입을 확인할 수 없습니다.');
