var request = superagent;

(function () {

	// for IE 7

	if (!window.localStorage) {
		window.localStorage = {
			getItem: function () {},
			setItem: function () {},
			removeItem: function () {}
		}
		window.sessionStorage = {
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

	window.msie = /msie/.test(navigator.userAgent.toLowerCase());

})();

(function () {

	window.init = {};

	var funcs = [];

	window.init.add = function (func) {
		funcs.push(func);
	};

	$(function () {
		console.log('init:');

		var i = 0;
		var len = funcs.length;

		for (i = 0; i < len; i++) {
			funcs[i]();
		}
	});

})();

init.add(function () {

	var error = window.error = {};

	error.ERROR_SET = 10;

	error.NOT_AUTHENTICATED = 101;
	error.NOT_AUTHORIZED = 102;

	error.INVALID_DATA = 201;

});

init.add(function () {

	window.$window = $(window);
	window.$document = $(document);
	window.$content = $('#content');

	window.url = {};
	window.url.pathnames = window.location.pathname.slice(1).split('/');
	window.url.query = (function () {
		var plusRe = /\+/g;
		var paramRe = /([^&=]+)=?([^&]*)/g;
		var search = window.location.search.slice(1);
		var query = {};
		var match;
		while (match = paramRe.exec(search)) {
			query[match[1]] = decodeURIComponent(match[2].replace(plusRe, " "));
		}
		return query;
	})();

});

