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
    if ($form.$send) {
      /** ?? **/ $form.$send.button();
    }
    return $form;
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

  // ['post', 'put'].forEach(function (method) {
  //   formty[method] = (function (method) {
  //     return function (url, $form, done) {
  //       formty.clearAlerts($form);
  //       formty.showSending($form);
  //       var req = superagent[method].call(superagent, url);
  //       var form = formty.toObject($form);
  //       var attached = false;
  //       $('input[type=file]', $form).each(function () {
  //         var name = $(this).val();
  //         if (name) {
  //           console.log('name');
  //           attached = true;
  //           req.attach('files', name);
  //         }
  //       });
  //       if (attached) {
  //         // json 으로 못 보내고 multipart 의 field 로 보낼 때 checkbox[...] 처리는? 
  //         // 다음에 닥치면 확인.
  //         req.field('json', JSON.stringify(form));
  //       } else {
  //         return;
  //       }
  //       req.end(function (err, res) {
  //         // 4xx or 5xx response with superagent is not considered an error by default.
  //         // err = err || res.error; 
  //         //
  //         // 1.0 부터 2XX 아 아니면 err 가 만들어진다. 
  //         if (err) {
  //           showError(err);
  //           formty.hideSending($form);
  //           return;
  //         }
  //         if (res.body.err) {
  //           if (res.body.err.code === error.INVALID_FORM.code) {
  //             formty.addAlerts($form, res.body.err.errors);
  //             formty.hideSending($form);
  //             return;
  //           }
  //           showError(res.body.err);
  //           formty.hideSending($form);
  //           return;
  //         }
  //         // formty.hideSending($form) 을 부르지 않는다.
  //         // 보통 페이지 이동이 일어나므로 버튼을 바꿀 필요가 없다.
  //         done(null, res);
  //       });
  //     };
  //   })(method)
  // });

  window.request = {};
  ['post', 'put', 'get', 'del'].forEach(function (method) {
    request[method] = (function (method) {
      return function (url, obj, extra, done) {
        if (typeof obj == 'function') {
          done = obj;
          obj = extra = null;
        } else if (typeof extra == 'function') {
          done = extra;
          extra = null;
        }
        var data;
        var ctype;
        if (obj instanceof jQuery) {
          data = new FormData(obj[0]);
          for (var key in extra) {
            data.append(key, extra[key]);
          }
        } else if (obj) {
          data = JSON.stringify(obj);
          ctype = 'application/json';
        }
        var req = new XMLHttpRequest();
        req.open(method, url);
        req.onload = onload;
        if (ctype) {
          req.setRequestHeader('Content-Type', ctype);
        }
        console.log('req.send');
        console.log({
          method: method,
          url: url,
          obj: obj,
          extra: extra,
          data: data,
          ctype: ctype
        })
        req.send(data);

        function onload() {
          if (req.status == 200) {
            done(null, { 
              req: req, 
              body: JSON.parse(req.responseText) || {} 
            });
          } else {
            done(new Error(req.statusText));
          }
        }
      };
    })(method);
  });

  ['post', 'put'].forEach(function (method) {
    formty[method] = (function (method) {
      return function (url, $form, extra, done) {
        formty.clearAlerts($form);
        formty.showSending($form);
        request[method].call(request, url, $form, extra, function (err, res) {
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

  function toObject($form) {
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
