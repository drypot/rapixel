
init.add(function () {

	window.photol = {};

	photol.initPhotoView = function (photo) {
		renderPhoto(photo);
		$('#update-btn').click(function () {
			location = '/photos/' + photo._id + '/update';
			return false;
		});
		$('#del-btn').click(function () {
			$('#del-confirm-btn').removeClass('hide');
			return false;
		});
		$('#del-confirm-btn').click(function () {
			request.del('/api/photos/' + photo._id).end(function (err, res) {
				err = err || res.error || res.body.err;
				if (err) return showError(res.body.err);
				location = '/';
			});
			return false;
		});
	};

	function renderPhoto(photo) {
		var $photo = $('.photo');
		var screenWidth = screen.width > screen.height ? screen.width : screen.height;
		if (window.devicePixelRatio > 1) {
			screenWidth *= 2;
		}
		var ver;
		for (var i = 0; i < photo.vers.length; i++) {
			ver = photo.vers[i]
			if (photo.vers[i+1] < screenWidth ) {
				break;
			}
		}

		var $img = $('<img>', {
			src: photo.dir + '/' + photo._id + '-' + ver + '.jpg'
		});

		$window.on('resize', function () {
			var windowWidth = $(window).width();
			var diff = Math.abs(ver - windowWidth) / ver;
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

	photol.initUpdateForm = function (photo) {
		var $form = formty.getForm('#form');
		formty.initFileGroup($form, 'files');
		$form.$send.click(function (err, res) {
			formty.put('/api/photos/' + photo._id, $form, function (err) {
				if (err) return showError(err);
				location = '/photos/' + photo._id;
			});
			return false;
		});
	};

});