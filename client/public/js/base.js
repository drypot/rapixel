var request = superagent;

(function () {

	// for IE 7

	if (!window.localStorage) {
		window.localStorage = {
			getItem: function () {},
			setItem: function () {},
			removeItem: function () {}
		}
	}

	if (!window.console) {
		window.console = {
			log: function () {}
		}
	}

})();

(function () {

	window.init = {};

	var funcs = [];

	window.init.add = function (func) {
		funcs.push(func);
	};

	window.init.reset = function () {
		funcs = [];
	}

	window.init.run = function () {
		console.log('init:');
		console.log('before init: ' + Object.keys(window));

		var i = 0;
		var len = funcs.length;

		for (i = 0; i < len; i++) {
			funcs[i]();
		}

		console.log('after init: ' + Object.keys(window));
	};

	init.reset();

	$(function () {
		init.run();
	});

})();

init.add(function () {

	var error = window.error = {};

	error.NOT_AUTHENTICATED = 101;
	error.NOT_AUTHORIZED = 102;
	error.INVALID_PASSWORD = 103;

	error.INVALID_DATA = 201;
	error.INVALID_CATEGORY = 202;
	error.INVALID_THREAD = 203;
	error.INVALID_POST = 204

});

init.add(function () {

	window.$window = $(window);
	window.$document = $(document);
	window.$content = $('#content');

	window.url = new URI(location.toString());
	window.query = url.query(true);

});

init.add(function () {

	window.ping = function () {
		request.get('/api/hello').end(function (err, res) {
			if (err || !res.ok) {
				console.log('ping: error');
				return;
			}
			console.log('ping:');
		});
	};

	window.ping.repeat = function () {
		window.setInterval(function() {
			request.get('/api/hello').end(function (err, res) {
				if (err || !res.ok) {
					console.log('ping: error');
					return;
				}
				console.log('ping:');
			});
		}, 1000 * 60 * 5); // 5 min
	};

});
