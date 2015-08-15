var util2 = exports;

util2.defineMethod = function (con, methodName, fn) {
  Object.defineProperty(
    con, methodName, { value : fn, writable: true, enumerable: false, configurable: true}
  );
}

util2.find = function (a, fn) {
  for (var i = 0; i < a.length; i++) {
    var item = a[i];
    if (fn(item)) return item;
  }
  return null;
};

util2.mergeObject = function () {
  var tar = arguments[0];
  for (var i = 1; i < arguments.length; i++) {
    var src = arguments[i];
    for (var p in src) {
      tar[p] = src[p];
    }
  }
}

util2.mergeArray = function () {
  var tar = arguments[0];
  var fn = arguments[arguments.length -1];
  for (var a = 1; a < arguments.length - 1; a++) {
    var src = arguments[a];
    sloop:
    for (var s = 0; s < src.length; s++) {
      for (var t = 0; t < tar.length; t++) {
        if (fn(tar[t], src[s])) {
          tar[t] = src[s];
          continue sloop;
        }
      }
      tar.push(src[s]);
    }
  }
}

// functional if

util2.fif = function (condi, f1, f2, f3) {
  if (f3) {
    if (condi) {
      f1(f3);
    } else {
      f2(f3);
    }
  } else {
    if (condi) {
      f1(f2);
    } else {
      f2();
    }    
  }
};

// 마지막 인자 콜백을 바로 호출. 
// 테스트 디버깅 용으로 만들었던 듯.

util2.pass = function () {
  arguments[arguments.length - 1]();
}

// datetime

function pad(number) {
  var r = String(number);
  if ( r.length === 1 ) {
    r = '0' + r;
  }
  return r;
}

util2.toDateTimeString = function (d) {
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' +
    pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
};

util2.toDateString = function (d) {
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
};

util2.toDateStringNoDash = function (d) {
  return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate());
};

// url

util2.makeUrl = function(url, params) {
  var qm;

  for(var p in params) {
    if (qm) {
      url += '&';
    } else {
      url += '?';
      qm = true;
    }
    url += p;
    url += '=';
    url += params[p];
  }

  return url;
};

util2.UrlMaker = function(url) {
  this.url = '' + url;
  this.qm = false;
}

util2.UrlMaker.prototype.add = function (name, value, def) {
  if (def !== undefined && def === value) {
    return this;
  }
  if (!this.qm) {
    this.url += '?';
    this.qm = true;
  } else {
    this.url += '&';
  }
  this.url += name;
  this.url += '=';
  this.url += value;
  return this;
}

util2.UrlMaker.prototype.done = function () {
  return this.url;
}

// tokenzier

// stop words from lucene

var stops = [
  'a', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for', 'if', 'in', 'into', 'is', 'it', 'no', 'not',
  'of', 'on', 'or', 's', 'such', 't', 'that', 'the', 'their', 'then', 'there', 'these', 'they', 'this',
  'to', 'was', 'will', 'with', '', 'www'
];

var engx = /\w+/g
var unix = /[\u0100-\uffff]+/g

util2.tokenize = function () {
  var tokens = [];
  var len = arguments.length;
  for (var i = 0; i < len; i++) {
    tokenizeEng(arguments[i]);
    tokenizeUni(arguments[i]);
  }
  return Object.keys(tokens);

  function tokenizeEng(source) {
    var engs = source.match(engx);
    if (engs) {
      var len = engs.length;
      for(var i = 0; i < len; i++) {
        var word = engs[i].toLowerCase();
        if (~stops.indexOf(word)) {
          continue;
        }
        tokens[word] = true;
      }
    }
  }

  function tokenizeUni(source) {
    var unis = source.match(unix);
    if (unis) {
      var len = unis.length;
      for (var i = 0; i < len; i++) {
        var word = unis[i];
        var wordLen = word.length;
        if (wordLen == 1) {
          continue;
        }
        var prev = undefined;
        for (var j = 0; j < wordLen; j++) {
          var ch = word[j]
          if (!prev) {
            prev = ch;
            continue;
          }
          tokens[prev + ch] = true;
          prev = ch;
        }
      }
    }
  }
};
