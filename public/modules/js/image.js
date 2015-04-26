
$(function () {
  window.imagel = {};

  imagel.initList = function () {
  };

  imagel.initNew = function () {
    var $form = formty.getForm('form.main');
    $form.$send.click(function (err, res) {
      formty.post('/api/images', $form, function () {
        location = '/';
      });
      return false;
    });
  };

  imagel.initUpdate = function (image) {
    var $form = formty.getForm('form.main');
    $form.$send.click(function (err, res) {
      formty.put('/api/images/' + image._id, $form, function () {
        location = '/images/' + image._id;
      });
      return false;
    });
  };

  imagel.initView = function (image) {
    var $view = $('.image-view');
    var $img = $('.image-view img');
    var $comment = $('.image-info .comment');
    var $fs = $('#fs');

    var fit = appType === 'osoky' || appType == 'drypot';
    var raster = appType === 'rapixel' || appType === 'osoky';

    $img.click(function () {
      if (fullscreen.inFullscreen()) {
        fullscreen.exit();
      } else {
        history.back();
      }
      return false;
    });

    $comment.html(tagUpText($comment.html()));

    if (fullscreen.enabled) {
      $fs.parent().css('display', 'block');
      $fs.click(function () {
        fullscreen.request($view[0]);
        if (raster) {
          setRaster(true);
        }
        return false;
      });
    }

    $('#update-btn').click(function () {
      location = '/images/' + image._id + '/update';
      return false;
    });
    
    $('#del-btn').click(function () {
      $('#del-confirm-btn').removeClass('hide');
      return false;
    });
    
    $('#del-confirm-btn').click(function () {
      request.del('/api/images/' + image._id).end(function (err, res) {
        //err = err || res.error || res.body.err;
        err = err || res.body.err;
        if (err) return showError(res.body.err);
        location = '/';
      });
      return false;
    });

    if (fit) {
      $window.on('resize', function () {
        $img.css('max-height', window.innerHeight);
      });
      $window.trigger('resize');
    }

    if (raster) {
      setRaster(false);
    }
    
    function setRaster(fs) {
      var max;

      if (fs) {
        max = fit ? Math.min(window.screen.width, window.screen.height) : window.screen.width;
      } else {
        max = fit ? Math.min(window.innerWidth, window.innerHeight) : window.innerWidth;
      }

      if (window.devicePixelRatio > 1.5) {
        max *= window.devicePixelRatio;
      }

      // image.vers 예: [5120,3840,2880,2560,2048,1920,1680,1440,1366,1280,1136,1024,960,640]

      var ver;
      for (var i = 0; i < image.vers.length; i++) {
        ver = image.vers[i]
        if (ver === 640 || image.vers[i+1] < max ) {
          break;
        }
      }
      
      $img.attr('src', image.dir + '/' + image._id + '-' + ver + '.jpg');
    }
  };
});