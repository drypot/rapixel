var fs = require('fs');
var path = require('path');

var init = require('../main/init');
var config = require('../main/config');
var fs2 = require('../main/fs');

init.add(function (next) {

	exports.tmpFileExists = function (filename) {
		return fs.existsSync(tmpDir + '/' + filename);
	};

	exports.tmpFiles = function (files) {
		var tmpFiles = [];
		if (files) {
			if (!Array.isArray(files)) {
				files = [files];
			}
			files.forEach(function (file) {
				// 정상 업로드 size 가 0 으로 보고되는 경우 발견
				//if (file.size) {
					tmpFiles.push({
						name: file.name,
						tmpName: path.basename(file.path)
					});
				//}
			});
		}
		return tmpFiles;
	};

	exports.deleteTmpFiles = function (files) {
		if (files) {
			files.forEach(function (file) {
				var tmpName = path.basename(file.tmpName);
				try {
					fs.unlinkSync(tmpDir + '/' + tmpName);
				} catch (err) {
					if (err.code !== 'ENOENT') throw err;
				}
			});
		}
	}

	// Post File

	exports.postFileDir = function (postId) {
		return publicDir + '/post/' + Math.floor(postId / 10000) + '/' + postId
	};

	exports.postFileUrl = function (postId, fname) {
		return config.data.uploadUrl + '/post/' + Math.floor(postId / 10000) + '/' + postId + '/' + encodeURIComponent(fname);
	}

	exports.postFileExists = function (postId, filename) {
		return fs.existsSync(exports.postFileDir(postId) + '/' + filename);
	};

	exports.savePostFiles = function (postId, files, next) {
		if (!files || files.length == 0) {
			return next();
		}
		saveTmpFiles(files, [publicDir, 'post', Math.floor(postId / 10000), postId], next);
	};

	function saveTmpFiles(files, subs, next) {
		try {
			var tarDir = fs2.mkdirs(subs);
			var saved = [];
			for (var i = 0; i < files.length; i++) {
				var file = files[i];
				var safeName = fs2.safeFilename(path.basename(file.name));
				var tmpName = path.basename(file.tmpName);
				try {
					fs.renameSync(tmpDir + '/' + tmpName, tarDir + '/' + safeName);
				} catch (err) {
					if (err.code !== 'ENOENT') next(err);
				}
				saved.push({ name: safeName });
			}
			next(null, saved);
		} catch (err) {
			next(err);
		}
	}

	exports.deletePostFiles = function (postId, files, next) {
		if (!files || files.length == 0) {
			return next();
		}
		deleteFiles(files, exports.postFileDir(postId), next);
	};

	function deleteFiles(files, dir, next) {
		try {
			var deleted = [];
			files.forEach(function (file) {
				var name = path.basename(file)
				var p = dir + '/' + name;
//				console.log('deleting: ' + p);
				try {
					fs.unlinkSync(p);
				} catch (err) {
					if (err.code !== 'ENOENT') next(err);
				}
				deleted.push(name);
			});
			next(null, deleted);
		} catch (err) {
			next(err);
		}
	}

	var publicDir = config.data.uploadDir + '/public';
	var tmpDir = config.data.uploadDir + '/tmp';

	console.log('upload: ' + config.data.uploadDir);

	try {
		fs2.mkdirs([config.data.uploadDir, 'public', 'post']);
		fs2.mkdirs([config.data.uploadDir, 'tmp']);

		fs.readdirSync(tmpDir).forEach(function (filename) {
			fs.unlinkSync(tmpDir + '/' + filename);
		});
		next();
	} catch (err) {
		next(err);
	}

});
