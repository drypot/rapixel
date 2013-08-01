var init = require('../lang/init');
var fs2 = require('../fs/fs');
var dt = require('../lang/dt');
var config = require('../config/config');
var mongo = require('../mongo/mongo');

init.add(function (next) {
	exports.photoDir = config.data.uploadDir + '/public/photo'
	exports.photoUrl = config.data.uploadUrl + '/photo';
	fs2.makeDirs(exports.photoDir, next);
});

init.add(function (next) {
	mongo.photos = mongo.db.collection("photos");
	mongo.photos.ensureIndex({ uid: 1, _id: -1 }, next);
});

exports.getPhotoDir = function (id) {
	return fs2.makeDeepPath(upload.photoDir, id, 3);
};

exports.getOriginalPath = function (dir, id, format) {
	return dir + '/' + id + '-org.' + format;
}

exports.getVersionPath = function (dir, id, width) {
	return dir + '/' + id + '-' + width + '.jpg';
};
