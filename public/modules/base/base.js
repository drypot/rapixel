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

init.add(function () {
  window.$window = $(window);
  window.$document = $(document);
  window.$content = $('#content');

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

init.add(function () {
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


init.add(function() {
  var $modal = $('#error-modal');
  var $title = $modal.find('.modal-title');
  var $body = $modal.find('.modal-body');

  window.showError = function (err, done) {
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
    if (done) {
      $modal.on('hidden.bs.modal', done);
    }
    $modal.modal('show');
  };
});

init.add(function() {
  window.formty = {};

  var namex = /[^\[]+/;

  formty.getForm = function (sel) {
    var $form = $(sel);
    $form.find('input, textarea, select, button').each(function () {
      if (this.name) {
        var name = this.name.match(namex)[0];
        $form['$' + name] = $(this);
      }
    });
    if ($form.$send) {
      $form.$send.button();
    }
    return $form;
  };

  formty.toObject = function ($form) {
    var obj = {};
    $form.find('input, textarea, select').each(function () {
      if (this.name && !this.disabled) {
        var $this = $(this);
        var name = this.name.match(namex)[0];
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

  formty.initFileGroup = function ($form, name, adder) {
    var $fileTempl = $('#file-input-templ').children(0);
    var $fileTemplIE = $('#file-input-templ-msie').children(0);
    var $fileGroup = $form.find('.file-group');
    var $files = $('<div/>').addClass('files');
    var $adder = $('<div/>').addClass('glyphicon glyphicon-plus');

    $fileGroup.append($files);
    if (adder) {
      $fileGroup.append($adder);
    }
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

  formty.sendFiles = function ($form, done) {
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
          done(null, { body: data });
        },
        error:function (jqXHR, textStatus, errorThrown) {
          var err = {
            message: "Uploading Error",
            detail: jqXHR.responseText
          };
          done(err);
        }
      });
      return;
    }
    done(null, { body: {} });
  };

  // gen http methods

  ['post', 'get', 'put', 'del'].forEach(function (method) {
    formty[method] = (function (method) {
      return function (url, $form, done) {
        var form = formty.toObject($form);
        formty.clearAlerts($form);
        formty.showSending($form);
        formty.sendFiles($form, function (err, res) {
          if (err) {
            showError(err);
            formty.hideSending($form);
            return;
          }
          for (var key in res.body) {
            form[key] = res.body[key];
          }
          request[method].call(request, url).send(form).end(function (err, res) {
            // 4xx or 5xx response with superagent is not considered an error by default.
            // err = err || res.error; 
            //
            // 1.0 부터 2XX 아 아니면 err 가 만들어진다. 
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
        });
      };
    })(method)
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
