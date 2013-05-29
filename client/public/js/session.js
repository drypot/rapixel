
init.add(function () {

	window.session = {};

	session.initLogin = function () {
		var $form = formty.getForm('#login-form');
		$form.$email.focus();
		$form.$send.click(function () {
			formty.post('/api/sessions', $form, function (err) {
				if (err) return showError(err);
				location = '/';
			});
			return false;
		});
	};

	session.logout = function () {
		request.del('/api/sessions').end(function (err, res) {
			err = err || res.error || res.body.err;
			if (err) return showError.system(err);
			console.log('logged out');
			location = '/';
		});
	};

	session.initRegister = function () {
		var $form = formty.getForm('#reg-form');
		$form.$send.click(function () {
			formty.post('/api/users', $form, function (err, res) {
				location = '/users/login?newuser';
			});
			return false;
		});
	};

	session.initProfile = function () {
		var $profile = $('#profile');
		$profile.html(tagUpText($profile.html()));
	};

	session.initEditProfile = function () {
		var $form = formty.getForm('#edit-form');
		var uid = url.pathnames[1];
		$form.$send.click(function () {
			formty.put('/api/users/' + uid, $form, function (err, res) {
				location = '/users/' + uid;
			});
			return false;
		});
	};

});
