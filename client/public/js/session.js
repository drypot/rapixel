
init.add(function () {

	window.session = {};

	session.initLoginPage = function () {
		trySavedPassword(function (err, success) {
			if (err) return msgBox.error(err);
			if (success) {
				location = '/threads';
				return;
			}
			$content.find('[name=submit]').click(sendLoginForm);
		});
	};

	function trySavedPassword(next) {
		var pw = localStorage.getItem('password');
		if (!pw) return next(null, false);
		console.log('trying saved password,');
		request.post('/api/sessions').send({ password: pw }).end(function (err, res) {
			err = err || res.error || res.body.err;
			if (err) return next(err, false);
			next(null, true);
		});
	}

	function sendLoginForm() {
		var $password = $content.find('[name=password]');
		var $remember = $content.find('[name=remember]');
		alerts.clear($content);
		request.post('/api/sessions').send({ password: $password.val() }).end(function (err, res) {
			err = err || res.error;
			if (err) return msgBox.error(err);
			if (res.body.err) {
				alerts.add($password, res.body.err.message);
				return;
			}
			if ($remember.prop('checked')) {
				localStorage.setItem('password', $password.val());
			} else {
				localStorage.removeItem('password');
			}
			location = '/threads';
		});
		return false;
	}

	session.logout = function () {
		request.del('/api/sessions').end(function (err, res) {
			err = err || res.error || res.body.err;
			if (err) return msgBox.error(err);
			localStorage.removeItem('password');
			console.log('logged out');
			location = '/';
		});
	};

});
