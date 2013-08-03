var init = require('../lang/init');
var fs2 = require('../fs/fs');
var dt = require('../lang/dt');
var config = require('../config/config');
var mongo = require('../mongo/mongo');

var photob = exports;

init.add(function (next) {
	photob.photoDir = config.data.uploadDir + '/public/photo'
	photob.photoUrl = config.data.uploadUrl + '/photo';
	fs2.makeDirs(photob.photoDir, next);
});

init.add(function (next) {
	mongo.photos = mongo.db.collection("photos");
	mongo.photos.ensureIndex({ uid: 1, _id: -1 }, next);
});

photob.getPhotoDir = function (id) {
	return fs2.makeDeepPath(photob.photoDir, id, 3);
};

photob.getOriginalPath = function (dir, id, format) {
	return dir + '/' + id + '-org.' + format;
}

photob.getVersionPath = function (dir, id, width) {
	return dir + '/' + id + '-' + width + '.jpg';
};
