
init.add(function () {
	window.imagel = {};

	imagel.initImageView = function (image) {
		renderImage(image);

		var $comment = $('#comment');
		$comment.html(tagUpText($comment.html()));

		$('#update-btn').click(function () {
			location = '/images/' + image._id + '/update';
			return false;
		});
		$('#del-btn').click(function () {
			$('#del-confirm-btn').removeClass('hide');
			return false;
		});
		$('#del-confirm-btn').click(function () {
			request.del('/api/images/' + image._id).end(function (err, res) {
				err = err || res.error || res.body.err;
				if (err) return showError(res.body.err);
				location = '/';
			});
			return false;
		});
	};

	function renderImage(image) {
		var windowWidth = $window.width()
		if (window.devicePixelRatio > 1) {
			windowWidth *= window.devicePixelRatio;
		}

		var ver;
		for (var i = 0; i < image.vers.length; i++) {
			ver = image.vers[i]
			if (ver == 640 || image.vers[i+1] < windowWidth ) {
				break;
			}
		}

		var $imgLow = $('img.low-res');
		$imgLow.click(function () {
			history.back();
			return false;
		});

		var $imgHi = $('img.hi-res');
		$imgHi.attr('src', image.dir + '/' + image._id + '-' + ver + '.jpg');
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

	imagel.initNewForm = function () {
		var $form = formty.getForm('#form');
		formty.initFileGroup($form, 'files', 'photo');
		$form.$send.click(function (err, res) {
			formty.post('/api/images', $form, function (err) {
				if (err) return showError(err);
				location = '/';
			});
			return false;
		});
	};

	imagel.initUpdateForm = function (image) {
		var $form = formty.getForm('#form');
		formty.initFileGroup($form, 'files', 'photo');
		$form.$send.click(function (err, res) {
			formty.put('/api/images/' + image._id, $form, function (err) {
				if (err) return showError(err);
				location = '/images/' + image._id;
			});
			return false;
		});
	};
});