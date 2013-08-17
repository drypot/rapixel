var config = require('../config/config');
var error = require('../error/error');
var imageb = require('../image/image-base');

exports.minWidth = 3840;
exports.minHeight = 2160;

exports.versions = [
	{ width:5120, height: 2880 },
	{ width:3840, height: 2160 },
	{ width:2880, height: 1620 },
	{ width:2560, height: 1440 },
	{ width:2048, height: 1152 },
	{ width:1920, height: 1080 },
	{ width:1680, height: 945 },
	{ width:1440, height: 810 },
	{ width:1366, height: 768 },
	{ width:1280, height: 720 },
	{ width:1136, height: 640 },
	{ width:1024, height: 576 },
	{ width:960 , height: 540 },
	{ width:640 , height: 360 }
];

exports.checkImageMeta = function (meta, next) {
	if (meta.width < exports.minWidth - 15 || meta.height < exports.minHeight - 15 ) {
		return next(error(error.ids.IMAGE_SIZE));
	}
	next(null, meta);
};

exports.makeVersions = function (org, width, dir, id, next) {
	imageb.makeVersions(org, width, dir, id, exports.versions, next);
};

exports.fillFields = function (image, form, vers) {
	image.width = meta.width;
	image.height = meta.height;
	image.vers = vers;
	image.comment = form.comment;
}