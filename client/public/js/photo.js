
init.add(function () {

	window.photol = {};

	photol.initPhotoView = function (photo) {
		renderPhoto(photo);
		$('#del-btn').click(function () {
			$('#del-confirm-btn').removeClass('hide');
			return false;
		});
		$('#del-confirm-btn').click(function () {
			request.del('/api/photos/' + photo._id).end(function (err, res) {
				err = err || res.error || res.body.err;
				if (err) return showError(res.body.err);
				history.go(-1);
			});
			return false;
		});
	};

	function renderPhoto(photo) {
		var $photo = $('.photo');
		var screenHeight = screen.width > screen.height ? screen.height : screen.width;
		if (window.devicePixelRatio > 1) {
			screenHeight *= 2;
		}
		var prevHeight;
		for (var i = 0; i < photo.vers.length; i++) {
			var height = photo.vers[i];
			if (screenHeight > height) {
				break;
			}
			prevHeight = height;
		}
		var srcHeight = prevHeight ? prevHeight : height;
		var srcWidth = srcHeight * 1.77777;
		var $img = $('<img>', {
			src: photo.dir + '/' + photo._id + '-' + srcHeight + '.jpg'
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

	photol.initNewForm = function () {
		var $form = formty.getForm('#form');
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