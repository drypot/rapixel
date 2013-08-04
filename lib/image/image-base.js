var init = require('../lang/init');
var fs2 = require('../fs/fs');
var dt = require('../lang/dt');
var config = require('../config/config');
var mongo = require('../mongo/mongo');

var imageb = exports;

init.add(function (next) {
	imageb.imageDir = config.uploadDir + '/public/image'
	imageb.imageUrl = config.uploadUrl + '/image';
	fs2.makeDirs(imageb.imageDir, next);
});

init.add(function (next) {
	mongo.images = mongo.db.collection("images");
	mongo.images.ensureIndex({ uid: 1, _id: -1 }, next);
});

imageb.getPhotoDir = function (id) {
	return fs2.makeDeepPath(imageb.imageDir, id, 3);
};

imageb.getOriginalPath = function (dir, id, format) {
	return dir + '/' + id + '-org.' + format;
}

imageb.getVersionPath = function (dir, id, width) {
	return dir + '/' + id + '-' + width + '.jpg';
};
