init.add(function() {

	var $modal = $('#error-modal');
	var $title = $modal.find('.modal-title');
	var $body = $modal.find('.modal-body');

	window.msgBox = function (header, text) {
		$title.empty();
		$title.append('<h3>' + header + '</h3>');
		$body.empty();
		$body.append('<p>' + text + '</p>');
		$modal.modal('show');
	};

	window.msgBox.error = function (err) {
		$title.empty();
		$title.append('<h3>시스템 오류</h3>');
		$body.empty();
		$body.append('<h3>Message</h3>');
		$body.append('<pre>' + err.message + '</pre>');
		$body.append('<h3>Stack</h3>');
		$body.append('<pre>' + err.stack + '</pre>');
		$modal.modal('show');
	};

});

init.add(function () {

	window.alerts = {};

	alerts.clear = function ($content) {
		$content.find('.alert').remove();
		$content.find('.has-error').removeClass('has-error');
	};

	alerts.add = function ($control, msg) {
		var $alert = $('<div>').addClass('alert alert-danger').text(msg);
		var $group = $control.closest('div');
		$group.addClass('has-error');
		$group.before($alert);
	};

});


init.add(function () {

	$('.navbar a[href="/logout"]').click(function () {
		session.logout();
		return false;
	});

});

//
//init.add(function () {
//
//	// TODO:
//
//	jQuery.fn.attachScroller = function(callback) {
//		var target = this;
//		var y = 0;
//		var ny = 0;
//		var timer = null;
//
//		function scroll() {
//			var scrollTop = document.documentElement.scrollTop + document.body.scrollTop;
//			var dy = y - scrollTop;
//			var ay = Math.max(Math.abs(Math.round(dy * 0.15)), 1) * (dy < 0 ? -1 : 1);
//			clearTimeout(timer);
//			if (Math.abs(dy) > 3 && Math.abs(ny - scrollTop) < 3) {
//				ny = scrollTop + ay;
//				scrollTo(0, ny);
//				timer = setTimeout(scroll, 10);
//			} else {
//				if (callback) callback();
//			}
//		}
//
//		var viewportHeight = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight;
//		y = target.offset().top;
//		y = y - (viewportHeight / 4);
//		y = Math.round(Math.max(y, 0));
//		timer = setTimeout(scroll, 0);
//	}
//
//});

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
