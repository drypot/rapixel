
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
		var scHeight = screen.width > screen.height ? screen.height : screen.width;
		var $photo = $('.photo');
		for (var i = 0; i < p.vers.length; i++) {
			var height = p.vers[i];
			if (scHeight * 1.2 >= height) {
				break;
			}
		}
		var $img = $('<img>', {
			src: p.dirUrl + '/' + p._id + '-' + height + '.jpg'
		});

		$photo.append($img);
	};
});