var should = require('should');
var fs = require('fs');
var path = require('path');

var init = require('../lang/init');
var config = require('../config/config');
var fs2 = require('../fs/fs');
var express = require('../express/express');
var usera = require('../user/user-auth');

var tmpDir;

init.add(function (next) {
	console.log('upload: ' + config.uploadDir);

	tmpDir = config.uploadDir + '/tmp',
	fs2.makeDirs(tmpDir, function (err) {
		if (err) return next(err);
		fs2.emptyDir(tmpDir, next);
	});
});

init.add(function () {
	var app = express.app;

	app.post('/api/upload', function (req, res) {
		if (req.query.rtype === 'html') {
			usera.getUser(res, function (err, user) {
				if (err) return res.send(JSON.stringify(err));
				res.send(JSON.stringify(getFiles(req)));
			});
		} else {
			usera.getUser(res, function (err, user) {
				if (err) return res.jsonErr(err);
				res.json(getFiles(req));
			});
		}
	});

	app.delete('/api/upload', function (req, res) {
		usera.getUser(res, function (err, user) {
			if (err) return res.jsonErr(err);
			deleteFiles(req, function (err) {
				if (err) return res.jsonErr(err);
				res.json({});
			});
		});
	});
});

function getFiles(req) {
	var files = {};
	for (var key in req.files) {
		var rfiles = req.files[key];
		if (!Array.isArray(rfiles)) {
			rfiles = [rfiles];
		}
		for (var i = 0; i < rfiles.length; i++) {
			var rfile = rfiles[i];
			if (/*rfile.size &&*/ rfile.name) {
				if (!files[key]) {
					files[key] = [];
				}
				files[key].push({
					oname: rfile.name,
					tname: path.basename(rfile.path)
				});
			}
		}
	}
	return files;
};

function deleteFiles(req, next) {
	var files = req.body.files;
	if (files) {
		var i = 0;
		function del() {
			if (i == files.length) return next();
			var file = files[i++];
			fs.unlink(exports.getPath(path.basename(file)), function (err) {
				if (err && err.code !== 'ENOENT') return next(err);
				setImmediate(del);
			});
		}
		del();
	}
}

exports.getPath = function (tname) {
	return tmpDir + '/' + tname;
}

exports.normalizeFiles = function (files) {
	files = files || [];
	for (var i = 0; i < files.length; i++) {
		var file = files[i];
		file.oname = fs2.safeFilename(path.basename(file.oname));
		file.tname = path.basename(file.tname);
		file.tpath = exports.getPath(file.tname);
	}
	return files;
};

exports.deleter = function (files, next) {
	return function () {
		var _arg = arguments;
		if (!files) {
			return next.apply(null, _arg);
		}
		var i = 0;
		function unlink() {
			if (i == files.length) {
				return next.apply(null, _arg);
			}
			var file = files[i++];
			fs.unlink(file.tpath, function (err) {
				setImmediate(unlink);
			});
		}
		unlink();
	};
};

// for test

exports.upload = function (file, count, next) {
	if (typeof count == 'function') {
		next = count;
		count = 1;
	}
	var req = express.post('/api/upload');
	for (var i = 0; i < count; i++) {
		req.attach('files', file);
	}
	req.end(function (err, res) {
		should(!err);
		should(!res.error);
		should(!res.body.err);
		res.body.files.should.length(count);
		next(null, res.body.files);
	});
};

