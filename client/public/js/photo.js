
init.add(function () {

	window.photol = {};

	photol.initPhotoView = function (photo) {
		renderPhoto(photo);

		var $comment = $('#comment');
		$comment.html(tagUpText($comment.html()));

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
		var windowWidth = $window.width()
		if (window.devicePixelRatio > 1) {
			windowWidth *= window.devicePixelRatio;
		}

		var ver;
		for (var i = 0; i < photo.vers.length; i++) {
			ver = photo.vers[i]
			if (ver == 640 || photo.vers[i+1] < windowWidth ) {
				break;
			}
		}

		var $imgLow = $('img.low-res');
		$imgLow.click(function () {
			history.back();
			return false;
		});

		var $imgHi = $('img.hi-res');
		$imgHi.attr('src', photo.dir + '/' + photo._id + '-' + ver + '.jpg');
		$imgHi.click(function () {
			history.back();
			return false;
		});

		$window.on('resize', function () {
			var windowWidth = $window.width();
			var imgWidth = windowWidth + 8 > ver ? ver : windowWidth;
			$imgHi.width(imgWidth);
			$imgLow.width(imgWidth);
			$imgHi.offset({ top: 0, left: (windowWidth - imgWidth) / 2});
		});

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