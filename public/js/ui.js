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
		for (var key in $form.extra) {
			obj[key] = $form.extra[key];
		}
		return obj;
	};

	formty.initFileGroup = function ($form, name) {
		var $fileTempl = $('#file-input-templ').children(0);
		var $fileTemplIE = $('#file-input-templ-msie').children(0);
		var $files = $form.find('.file-group .files');
		var $adder = $form.find('.file-group .glyphicon-plus');

		function addFileInput() {
			var $set = msie ? $fileTemplIE.clone(): $fileTempl.clone();

			var $file = $set.find('input[type="file"]');
			$file.attr('name', name);

			if (!msie) {
				var $btn = $set.find('button');
				$btn.click(function () {
					$file.click();
					return false;
				});
				$file.on('change', function () {
					var files = $file[0].files;
					var text = files.length + ' files selected';
					$btn.text(text);
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
			$.ajax('/api/upload?rtype=html', {
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

	// gen http methods

	var methods = [ 'post', 'get', 'put', 'del' ];

	for (var i = 0; i < methods.length; i++) {
		var method = methods[i];
		formty[method] = (function (method) {
			return function (url, $form, next) {
				var form = formty.toObject($form);
				formty.clearAlerts($form);
				formty.showSending($form);
				formty.sendFiles($form, function (err, res) {
					if (err) {
						formty.hideSending($form);
						return next(err);
					}
					for (var key in res.body) {
						form[key] = res.body[key];
					}
					request[method].call(request, url).send(form).end(function (err, res) {
						err = err || res.error;
						if (err) {
							formty.hideSending($form);
							return next(err);
						}
						if (res.body.err) {
							if (res.body.err.code === error.ids.ERRORS.code) {
								formty.addAlerts($form, res.body.err.errors);
								formty.hideSending($form);
								return;
							}
							showError(res.body.err);
							formty.hideSending($form);
							return;
						}
						// formty.hideSending($form) 을 부르지 않는다.
						// 보통 페이지 이동이 일어나므로 버튼을 바꿀 필요가 없다.
						next(null, res);
					});
				});
			};
		})(method)
	}

	formty.showSending = function ($form) {
		var $sendPanel = $form.find('.send-panel');
		var $sendingPanel = $form.find('.sending-panel');
		if ($sendPanel.length && $sendingPanel.length) {
			$sendPanel.addClass('hide');
			$sendingPanel.removeClass('hide');
		}
	};

	formty.hideSending = function ($form) {
		var $sendPanel = $form.find('.send-panel');
		var $sendingPanel = $form.find('.sending-panel');
		if ($sendPanel.length && $sendingPanel.length) {
			$sendPanel.removeClass('hide');
			$sendingPanel.addClass('hide');
		}
	};

	formty.clearAlerts = function ($form) {
		$form.find('.alert').remove();
		$form.find('.has-error').removeClass('has-error');
		$form.find('.text-danger').remove();
	};

	formty.addAlert = function ($control, msg) {
		var $group = $control.closest('.form-row');
		$group.addClass('has-error');
		//$control.before($('<div>').addClass('alert alert-danger').text(msg));
		$group.append($('<p>').addClass('error text-danger').text(msg));
	};

	formty.addAlerts = function ($form, errors) {
		for (var i = 0; i < errors.length; i++) {
			var error = errors[i];
			formty.addAlert($form.find('[name="' + error.field + '"]'), error.message);
		}
	}

});

init.add(function() {

	var $modal = $('#error-modal');
	var $title = $modal.find('.modal-title');
	var $body = $modal.find('.modal-body');

	window.showError = function (err, next) {
		$title.text(err.message);
		var body = '';
		if (err.stack) {
			body += '<p>System Error ' + err.stack.replace(/Error:.+\n/, '').replace(/\n/g, '<br>') + '</p>';
		}
		if (err.detail) {
			body += '<pre>' + err.detail.replace(/\n/g, '<br>') + '</pre>';
		}
		console.log(body);
		$body.html(body);
		$modal.off('hidden.bs.modal');
		if (next) {
			$modal.on('hidden.bs.modal', next);
		}
		$modal.modal('show');
	};

});

init.add(function () {

	$('#logout-btn').click(function () {
		userl.logout();
		return false;
	});

});
