init.add(function() {

	window.formty = {};

	var nameRe = /[^\[]+/;

	formty.getForm = function (sel) {
		var $form = $(sel);
		$form.find('input, textarea, select, button').each(function () {
			if (this.name) {
				var name = this.name.match(nameRe)[0];
				$form['$' + name] = $(this);
			}
		});
		return $form;
	};

	formty.toObject = function ($form) {
		var obj = {};
		$form.find('input, textarea, select').each(function () {
			if (this.name && !this.disabled) {
				var $this = $(this);
				var name = this.name.match(nameRe)[0];
				var braket = this.name.length != name.length;
				if (this.type == 'checkbox') {
					if (braket) {
						if ($this.prop('checked')) {
							if (obj[name]) {
								obj[name].push($this.val());
							} else {
								obj[name] = [$this.val()];
							}
						}
					} else {
						obj[name] = $this.prop('checked');
					}
					return;
				}
				if (this.type == 'file') {
					return;
				}
				obj[name] = $this.val();
			}
		});
		return obj;
	};

	formty.initFileGroup = function ($form, name) {
		var $fileTempl = $('#file-input-templ').children(0);
		var $fileTemplIE = $('#file-input-templ-msie').children(0);
		var $files = $form.find('.file-group .files');
		var $adder = $form.find('.file-group .glyphicon-plus');
		var basename = /[^\\]+$/;

		function addFileInput() {
			var $set = msie ? $fileTemplIE.clone(): $fileTempl.clone();

			var $file = $set.find('input[type="file"]');
			$file.attr('name', name);

			if (!msie) {
				var $text = $set.find('input[type="text"]');
				var $btn = $set.find('button');
				$btn.click(function () {
					$file.click();
					return false;
				});
				$file.on('change', function () {
					var files = $file[0].files;
					var text;
					if (files && files.length > 1) {
						text = files.length + ' files';
					} else {
						text = basename.exec($file.val())[0];
					}
					$text.val(text);
				});
			}
			$files.append($set);
		}

		addFileInput();
		$adder.click(function () {
			addFileInput();
			return false;
		});
	};

	formty.sendFiles = function ($form, next) {
		var files = $('input[type=file]', $form).filter(function () {
			return $(this).val();
		});
		if (files.length) {
			console.log('sending ' + files.length + ' files.');
			$.ajax('/upload', {
				dataType: 'json',
				method: 'POST',
				files: files,
				iframe: true,
				success: function(data, textStatus, jqXHR) {
					next(null, { body: data });
				},
				error:function (jqXHR, textStatus, errorThrown) {
					var err = {
						message: "Uploading Error",
						detail: jqXHR.responseText
					};
					next(err);
				}
			});
			return;
		}
		next(null, { body: {} });
	};

	var methods = [ 'post', 'get', 'put', 'del' ];

	for (var i = 0; i < methods.length; i++) {
		var method = methods[i];
		formty[method] = (function (method) {
			return function (url, $form, next) {
				var form = formty.toObject($form);
				formty.clearAlerts($form);
				formty.showSending($form);
				formty.sendFiles($form, function (err, res) {
					if (err) return next(err);
					form.files = res.body.files;
					request[method].call(request, url).send(form).end(function (err, res) {
						err = err || res.error;
						if (err) return next(err);
						if (res.body.err) {
							if (res.body.err.rc === error.ERROR_SET) {
								formty.addAlerts($form, res.body.err.errors);
								formty.hideSending($form);
								return;
							}
							showError(res.body.err);
							formty.hideSending($form);
							return;
						}
						next(null, res);
					});
				});
			};
		})(method)
	}

	formty.showSending = function ($form) {
		var $send = $form.find('[name=send]');
		var $sending = $form.find('[name=sending]');
		if ($send.length && $sending.length) {
			$send.addClass('hide');
			$sending.removeClass('hide');
		}
	};

	formty.hideSending = function ($form) {
		var $send = $form.find('[name=send]');
		var $sending = $form.find('[name=sending]');
		if ($send.length && $sending.length) {
			$form.find('[name=send]').removeClass('hide');
			$form.find('[name=sending]').addClass('hide');
		}
	};

	formty.clearAlerts = function ($form) {
		$form.find('.alert').remove();
		$form.find('.has-error').removeClass('has-error');
		$form.find('.text-danger').remove();
	};

	formty.addAlert = function ($control, msg) {
		var $group = $control.closest('div');
		$group.addClass('has-error');
		//$control.before($('<div>').addClass('alert alert-danger').text(msg));
		$group.append($('<p>').addClass('error text-danger').text(msg));
	};

	formty.addAlerts = function ($form, fields) {
		for (var i = 0; i < fields.length; i++) {
			var field = fields[i];
			formty.addAlert($form.find('[name="' + field.name + '"]'), field.msg);
		}
	}

});

init.add(function() {

	var $modal = $('#error-modal');
	var $title = $modal.find('.modal-title');
	var $body = $modal.find('.modal-body');

	window.showError = function (err, next) {
		$title.empty();
		$title.append('<h3>시스템 오류</h3>');
		$body.empty();
		$body.append('<h3>Message</h3>');
		$body.append('<pre>' + err.message + '</pre>');
		if (err.stack) {
			$body.append('<h3>Stack</h3>');
			$body.append('<pre>' + err.stack + '</pre>');
		}
		if (err.detail) {
			$body.append('<h3>Detail</h3>');
			$body.append('<pre>' + err.detail + '</pre>');
		}
		$modal.off('hidden.bs.modal');
		if (next) {
			$modal.on('hidden.bs.modal', next);
		}
		$modal.modal('show');
	};

});

init.add(function () {

	$('#logout-btn').click(function () {
		session.logout();
		return false;
	});

});

init.add(function () {

	window.spinner = new Spinner({
		lines: 11, // The number of lines to draw
		length: 5, // The length of each line
		width: 2, // The line thickness
		radius: 6, // The radius of the inner circle
		rotate: 0, // The rotation offset
		color: '#000', // #rgb or #rrggbb
		speed: 1, // Rounds per second
		trail: 60, // Afterglow percentage
		shadow: false, // Whether to render a shadow
		hwaccel: false, // Whether to use hardware acceleration
		className: 'spinner', // The CSS class to assign to the spinner
		zIndex: 2e9, // The z-index (defaults to 2000000000)
		top: 'auto', // Top position relative to parent in px
		left: 'auto' // Left position relative to parent in px
	});

});
