
init.add(function () {

	window.session = {};

	session.autoLogin = function () {
		if (window.user) return;

		var email = localStorage.getItem('email');
		var password = localStorage.getItem('password');

		if (!email || !password) return;

		console.log('trying saved password.');
		request.post('/api/sessions').send({ email: email, password: password }).end(function (err, res) {
			err = err || res.error || res.body.err;
			if (err) {
				localStorage.removeItem('email');
				localStorage.removeItem('password');
				showError.system(err);
				return ;
			}
			location.reload();
		});
	};

	session.initLogin = function () {
		var $form = $('#login-form');
		$form.find('[name=send]').click(function () {
			var form = {
				email: $form.find('[name=email]').val(),
				password: $form.find('[name=password]').val()
			};
			var $remember = $form.find('[name=remember]');
			alerts.clear($form);
			request.post('/api/sessions').send(form).end(function (err, res) {
				err = err || res.error;
				if (err) return showError.system(err);
				if (res.body.err) {
					var rc = res.body.err.rc;
					if (rc && rc == error.INVALID_PASSWORD) {
						alerts.add($form.find('[name=email]'), res.body.err.message);
						return;
					}
					return showError.system(res.body.err);
				}
				if ($remember.prop('checked')) {
					localStorage.setItem('email', form.email);
					localStorage.setItem('password', form.password);
				} else {
					localStorage.removeItem('email');
					localStorage.removeItem('password');
				}
				location = '/';
			});
			return false;
		});
	};

	session.logout = function () {
		request.del('/api/sessions').end(function (err, res) {
			err = err || res.error || res.body.err;
			if (err) return showError.system(err);
			localStorage.removeItem('email');
			localStorage.removeItem('password');
			console.log('logged out');
			location = '/';
		});
	};

	session.initRegister = function () {
		var $form = $('#reg-form');
		$form.find('[name=send]').click(function () {
			var form = {
				name: $form.find('[name=name]').val(),
				email: $form.find('[name=email]').val(),
				password: $form.find('[name=password]').val()
			};
			alerts.clear($form);
			request.post('/api/users').send(form).end(function (err, res) {
				err = err || res.error;
				if (err) return showError.system(err);
				if (res.body.err) {
					if (res.body.err.rc && res.body.err.rc == error.INVALID_DATA) {
						alerts.fill($form, res.body.err.fields);
						return;
					}
					return showError.system(res.body.err);
				}
				var $regModal = $('#reg-modal');
				$regModal.on('hidden.bs.modal', function () {
					location = '/users/login';
				});
				$regModal.modal('show');
			});
			return false;
		});
	};


});
