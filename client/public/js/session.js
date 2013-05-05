
init.add(function () {

	window.session = {};

	var $loginForm;
	var $regForm;

	session.initLogin = function () {
		if (window.user) return;
		trySaved(function (err, success) {
			if (!err && success) {
				location = '/';
				return;
			}
			$('#login-panel').removeClass('hide');
			$loginForm = $('#login-form');
			$loginForm.find('[name=submit]').click(sendLoginForm);
			if (err) return showError.system(err);
			session.initReg();
		});
	};

	function trySaved(next) {
		var email = localStorage.getItem('email');
		var password = localStorage.getItem('password');
		if (!email || !password) return next(null, false);
		console.log('trying saved password.');
		request.post('/api/sessions').send({ email: email, password: password }).end(function (err, res) {
			err = err || res.error || res.body.err;
			if (err) {
				localStorage.removeItem('email');
				localStorage.removeItem('password');
				return next(err, false);
			}
			next(null, true);
		});
	}

	function sendLoginForm() {
		var form = {
			email: $loginForm.find('[name=email]').val(),
			password: $loginForm.find('[name=password]').val()
		};
		var $remember = $loginForm.find('[name=remember]');
		request.post('/api/sessions').send(form).end(function (err, res) {
			err = err || res.error;
			if (err) return showError.system(err);
			if (res.body.err) {
				var rc = res.body.err.rc;
				if (rc && rc == error.INVALID_PASSWORD) {
					return showError('Retry Please', res.body.err.message);
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
	}

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

	session.initReg = function () {
		$regForm = $('#reg-form');
		$regForm.find('[name=submit]').click(sendRegForm);
	};

	function sendRegForm() {
		var form = {
			name: $regForm.find('[name=name]').val(),
			email: $regForm.find('[name=email]').val(),
			password: $regForm.find('[name=password]').val()
		};
		request.post('/api/users').send(form).end(function (err, res) {
			err = err || res.error;
			if (err) return showError.system(err);
			if (res.body.err) {
				var rc = res.body.err.rc;
				var fields = res.body.err.fields;
				if (rc && rc == error.INVALID_DATA) {
					var msg = '';
					for (var i = 0; i < fields.length; i++) {
						var field = fields[i];
						msg += field.msg + '<br>';
					}
					return showError('Retry Please', msg);
				}
				return showError.system(res.body.err);
			}
			var $regModal = $('#reg-modal');
			$regModal.on('hidden', function () {
				location = '/';
			});
			$regModal.modal('show');
		});
		return false;
	}


});
