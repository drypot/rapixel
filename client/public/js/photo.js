
init.add(function () {

	window.photo = {};

	photo.initPhotoView = function (p) {
		showPhoto(p);
		$('#del-btn').click(function () {
			request.del('/api/photos/' + p._id).end(function (err, res) {
				err = err || res.error || res.body.err;
				if (err) {
					return showError.system(res.body.err);
				}
				location = '/photos';
			});
			return false;
		});
		var $comment = $('.comment');
		$comment.html($comment.html().replace(/\n/g, '<br>'));
	};

	function showPhoto(p) {
		var $photo = $('.photo');
		var screenHeight = screen.width > screen.height ? screen.height : screen.width;
		if (window.devicePixelRatio > 1) {
			screenHeight *= 2;
		}
		var prevHeight;
		for (var i = 0; i < p.vers.length; i++) {
			var height = p.vers[i];
			if (screenHeight > height) {
				break;
			}
			prevHeight = height;
		}
		var srcHeight = prevHeight ? prevHeight : height;
		var srcWidth = srcHeight * 1.77777;
		var $img = $('<img>', {
			src: p.dir + '/' + p._id + '-' + srcHeight + '.jpg'
		});

		$window.on('resize', function () {
			var windowWidth = $(window).width();
			var diff = Math.abs(srcWidth - windowWidth) / srcWidth;
			if (diff > 0.02) {
				$img.css('width', '100%');
			} else {
				$img.css('width', '');
			}
		});

		$photo.append($img);
		$window.trigger('resize');
	}

});

init.add(function () {

	photo.initNewForm = function () {
		var $form = formty.getForm('#new-form');
		formty.initFileGroup($form, 'files');
		$form.$send.click(function (err, res) {
			formty.post('/api/photos', $form, function (err) {
				if (err) return showError(err);
				location = '/';
			});
			return false;
		});
	};

});