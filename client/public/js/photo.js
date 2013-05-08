
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

	var $img;
	var srcHeight;
	var srcWidth;

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
		srcHeight = prevHeight ? prevHeight : height;
		srcWidth = srcHeight * 1.77777;
		$img = $('<img>', {
			src: p.dirUrl + '/' + p._id + '-' + srcHeight + '.jpg'
		});
		setImgWidth();
		$photo.append($img);

		$window.on('resize', setImgWidth);
	};

	function setImgWidth() {
		var windowWidth = $(window).width();
		var diff = Math.abs(srcWidth - windowWidth) / srcWidth;
		if (diff > 0.02) {
			$img.css('width', '100%');
		} else {
			$img.css('width', '');
		}
	}
});