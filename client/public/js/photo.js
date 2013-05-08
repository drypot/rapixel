
init.add(function () {

	window.photo = {};

	photo.delPhoto = function (pid) {
		request.del('/api/photos/' + pid).end(function (err, res) {
			err = err || res.error || res.body.err;
			if (err) {
				return showError.system(res.body.err);
			}
			location = '/photos';
		});
	};

	photo.showPhoto = function (p) {
		var $photo = $('.photo');
		var screenHeight = screen.width > screen.height ? screen.height : screen.width;
		var prevHeight;
		for (var i = 0; i < p.vers.length; i++) {
			var height = p.vers[i];
			if (screenHeight > height) {
				break;
			}
			prevHeight = height;
		}
		var $img = $('<img>', {
			src: p.dirUrl + '/' + p._id + '-' + (prevHeight ? prevHeight : height) + '.jpg'
		});

		$photo.append($img);
	};
});