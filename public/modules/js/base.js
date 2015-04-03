window.msie = /msie/.test(navigator.userAgent.toLowerCase());

if (!window.console) {
  window.console = {
    log: function () {}
  }
}

$(function () {
  window.error = {};

  function define(code, msg) {
    error[code] = {
      code: code,
      message: msg
    }
  }

  define('INVALID_DATA', '비정상적인 값이 입력되었습니다.');
  define('INVALID_FORM', '*');

  define('NOT_AUTHENTICATED', '먼저 로그인해 주십시오.');
  define('NOT_AUTHORIZED', '사용 권한이 없습니다.');
});

$(function () {
  window.$window = $(window);
  window.$document = $(document);

  window.url = {};
  window.url.pathnames = window.location.pathname.slice(1).split('/');
  window.url.query = (function () {
    var plusx = /\+/g;
    var paramx = /([^&=]+)=?([^&]*)/g;
    var search = window.location.search.slice(1);
    var query = {};
    var match;
    while (match = paramx.exec(search)) {
      query[match[1]] = decodeURIComponent(match[2].replace(plusx, ' '));
    }
    return query;
  })();
});

$(function () {
  var patterns = [
    { // url
      pattern: /(https?:\/\/[^ "'><)\n\r]+)/g,
      replace: '<a href="$1" target="_blank">$1</a>'
    }
  ];

  window.tagUpText = function (s, pi) {
    if (pi == undefined) {
      pi = 0;
    }
    if (pi == patterns.length) {
      return s;
    }
    var p = patterns[pi];
    var r = '';
    var a = 0;
    var match;
    while(match = p.pattern.exec(s)) {
      r += tagUpText(s.slice(a, match.index), pi + 1);
      r += p.replace.replace(/\$1/g, match[1]);
      a = match.index + match[0].length;
    }
    r += tagUpText(s.slice(a), pi + 1);
    return r;
  };
});

$(function() {
  var $modal = $('#error-modal');
  var $title = $modal.find('.modal-title');
  var $body = $modal.find('.modal-body');

  window.showError = function (err, done) {
    $title.text(err.message);
    var body = '';
    if (err.stack) {
      body += '<p>' + err.stack.replace(/Error:.+\n/, '').replace(/\n/g, '<br>') + '</p>';
    }
    if (err.detail) {
      body += '<pre>' + err.detail.replace(/\n/g, '<br>') + '</pre>';
    }
    console.log(body);
    $body.html(body);
    $modal.off('hidden.bs.modal');
    if (done) {
      $modal.on('hidden.bs.modal', done);
    }
    $modal.modal('show');
  };
});

$(function () {
  window.xhr = {};
  ['post', 'put', 'get', 'del'].forEach(function (method) {
    xhr[method] = (function (method) {
      return function (url) {
        if (method == 'del') method = 'delete';
        return new XHR(method, url);
      }
    })(method);
  });

  function XHR(method, url) {
    this._method = method;
    this._url = url;
  }

  XHR.prototype.data = function (obj) {
    this._data = obj;
    return this;
  }

  XHR.prototype.form = function (form) {
    this._form = form instanceof jQuery ? form[0] : form;
    return this;
  }

  XHR.prototype.send = function (done) {
    var data;
    var ctype;
    if (this._form) {
      data = new FormData(this._form);
      for (var key in this._data) {
        data.append(key, this._data[key]);
      }
    } else if (this._data) {
      data = JSON.stringify(this._data);
      ctype = 'application/json';
    }
    var xhr = new XMLHttpRequest();
    xhr.open(this._method, this._url);
    xhr.onload = onload;
    if (ctype) {
      xhr.setRequestHeader('Content-Type', ctype);
    }
    xhr.send(data);

    function onload() {
      if (xhr.status == 200) {
        done(null, { 
          xhr: xhr, 
          body: JSON.parse(xhr.responseText) || {} 
        });
      } else {
        done(new Error(xhr.statusText));
      }
    }
  };
});

$(function() {
  window.formty = {};

  /* checkbox 이름에는 [] 이 딸 붙는다. */
  var namex = /[^\[]+/;

  formty.getForm = function (sel) {
    var $form = $(sel);
    $form.find('input, textarea, select, button').each(function () {
      if (this.name) {
        var name = this.name.match(namex)[0];
        $form['$' + name] = $(this);
      }
    });

    // 무슨 의미인지 잊음;
    // if ($form.$send) {
    //   $form.$send.button();
    // }
    
    return $form;
  };

  formty.initFileFieldAdder = function ($form) {
    $form.find('.file-inputs').each(function () {
      var $inputs = $(this);
      var $input = $inputs.children().first();
      var $adder =  $inputs.find('.adder');
      var $adderBtn = $('<button>').addClass('btn btn-default glyphicon glyphicon-plus');
      $adderBtn.click(function () {
        $input.clone().insertBefore($adder);
        return false;
      });
      $adderBtn.appendTo($adder);
    });
  };

  ['post', 'put'].forEach(function (method) {
    formty[method] = (function (method) {
      return function (url, $form, extra, done) {
        formty.clearAlerts($form);
        formty.showSending($form);
        xhr[method].call(xhr, url).form($form).data(extra).send(function (err, res) {
          if (err) {
            showError(err);
            formty.hideSending($form);
            return;
          }
          if (res.body.err) {
            if (res.body.err.code === error.INVALID_FORM.code) {
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
          done(null, res);
        });
      };
    })(method);
  });

  formty.showSending = function ($form) {
    if ($form.$send) {
      $form.$send.button('loading');
    }
    return;
  };

  formty.hideSending = function ($form) {
    if ($form.$send) {
      $form.$send.button('reset');
    }
    return;
  };

  formty.clearAlerts = function ($form) {
    $form.find('.has-error').removeClass('has-error');
    $form.find('.text-danger').remove();
  };

  formty.addAlert = function ($control, msg) {
    var $group = $control.closest('.form-group');
    $group.addClass('has-error');
    $group.append($('<p>').addClass('help-block text-danger').text(msg));
  };

  formty.addAlerts = function ($form, errors) {
    for (var i = 0; i < errors.length; i++) {
      var error = errors[i];
      formty.addAlert($form.find('[name="' + error.field + '"]'), error.message);
    }
  }
});
