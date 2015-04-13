var utilp = exports;

utilp.defineMethod = function (con, methodName, fn) {
  Object.defineProperty(
    con, methodName, { value : fn, writable: true, enumerable: false, configurable: true}
  );
}

utilp.find = function (a, fn) {
  for (var i = 0; i < a.length; i++) {
    var item = a[i];
    if (fn(item)) return item;
  }
  return null;
};

utilp.mergeObject = function () {
  var tar = arguments[0];
  for (var i = 1; i < arguments.length; i++) {
    var src = arguments[i];
    for (var p in src) {
      tar[p] = src[p];
    }
  }
}

utilp.mergeArray = function () {
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

utilp.fif = function (condi, case1, case2, next) {
  if (condi) {
    case1(next);
  } else {
    case2(next);
  }
};

// 마지막 인자 콜백을 바로 호출. 
// 테스트 디버깅 용으로 만들었던 듯.

utilp.pass = function () {
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

utilp.toDateTimeString = function (d) {
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' +
    pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
};

utilp.makeUrl = function(url, params) {
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

// tokenzier

// stop words from lucene

var stops = [
  'a', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for', 'if', 'in', 'into', 'is', 'it', 'no', 'not',
  'of', 'on', 'or', 's', 'such', 't', 'that', 'the', 'their', 'then', 'there', 'these', 'they', 'this',
  'to', 'was', 'will', 'with', '', 'www'
];

var engx = /\w+/g
var unix = /[\u0100-\uffff]+/g

utilp.tokenize = function () {
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
