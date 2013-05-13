
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
			src: p.dirUrl + '/' + p._id + '-' + srcHeight + '.jpg'
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
		var $form = $('#new-form');
		var sender = new Sender($form);

		addFileInput($form);

		$form.ajaxForm({
			dataType: 'json',
			beforeSend: function () {
				alerts.clear($form);
				sender.beforeSend();
			},
			success: function (body) {
				if (body.err && (body.err.rc / 100 | 0) == 3) {
					alerts.add($form.find('.files').parent(), body.err.message);
					sender.complete();
					return;
				}
				if (body.err) {
					showError.system(body.err);
					sender.complete();
					return;
				}
				location = '/';
			},
			error: function (xhr, textStatus, errorThrown) {
				message = textStatus || errorThrown || 'Unknown Error';
				showError.system({ message: message });
				sender.complete();
			}
		});
	};

	function addFileInput($form) {
		var $fileTempl = $('#input-file-templ');
		var $files = $form.find('.files');
		var basename = /[^\\]+$/;

		if (msie) {
			$files.append($('<div class="file"><input type="file" name="file" style="width:100%"></div>'));
			return;
		}
		var $set = $fileTempl.children(0).clone();
		var $file = $set.find('input[type="file"]');
		var $text = $set.find('input[type="text"]');
		var $btn = $set.find('button');
		$btn.click(function () {
			$file.click();
			return false;
		});
		$file.change(function () {
			var files = $file[0].files;
			var text;
			if (files && files.length > 1) {
				text = files.length + ' files';
			} else {
				text = basename.exec($file.val())[0];
			}
			$text.val(text);
		})
		$files.append($set);
	}

});