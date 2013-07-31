
init.add(function () {

	window.userl = {};

	userl.initLogin = function () {
		var $form = formty.getForm('#form');
		$form.$email.focus();
		$form.$send.click(function () {
			formty.post('/api/sessions', $form, function (err) {
				if (err) return showError(err);
				location = '/';
			});
			return false;
		});
	};

	userl.logout = function () {
		request.del('/api/sessions').end(function (err, res) {
			err = err || res.error || res.body.err;
			if (err) return showError(err);
			console.log('logged out');
			location = '/';
		});
	};

	userl.initRegister = function () {
		var $form = formty.getForm('#form');
		$form.$send.click(function () {
			formty.post('/api/users', $form, function (err, res) {
				location = '/users/login?newuser';
			});
			return false;
		});
	};

	userl.initResetReq = function () {
		var $form = formty.getForm('#form');
		$form.$email.focus();
		$form.$send.click(function () {
			formty.post('/api/resets', $form, function (err) {
				if (err) return showError(err);
				location = '?done';
			});
			return false;
		});
	};

	userl.initReset = function () {
		var $form = formty.getForm('#form');
		$form.extra = {
			id: url.query.id,
			token: url.query.t
		};
		$form.$password.focus();
		$form.$send.click(function () {
			formty.put('/api/resets', $form, function (err) {
				if (err) return showError(err);
				location = '/users/login';
			});
			return false;
		});
	};

	userl.initProfile = function () {
		var $profile = $('#profile-text');
		$profile.html(tagUpText($profile.html()));
	};

	userl.initUpdateProfileForm = function () {
		var $form = formty.getForm('#form');
		var uid = url.pathnames[1];
		$('#domain-url').text(location.origin + '/');
		$form.$send.click(function () {
			formty.put('/api/users/' + uid, $form, function (err, res) {
				location = '/users/' + uid;
			});
			return false;
		});
	};

	userl.initDeactivate = function () {
		$('#dea-btn').click(function () {
			$('#dea-confirm-btn').removeClass('hide');
			return false;
		});
		$('#dea-confirm-btn').click(function () {
			request.del('/api/users/' + user.id).end(function (err, res) {
				err = err || res.error || res.body.err;
				if (err) return showError(res.body.err);
				location = '/';
			});
			return false;
		});
	};
});
