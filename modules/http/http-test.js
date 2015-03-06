var should = require('should');

var http = require('../http/http');

describe("makeUrl", function () {
  it("should success", function () {
    var url = http.makeUrl('http://localhost/test');
    url.should.equal('http://localhost/test');
  });
  it("should success", function () {
    var params = {
      a: 10
    };
    var url = http.makeUrl('http://localhost/test', params);
    url.should.equal('http://localhost/test?a=10');
  });
  it("should success", function () {
    var params = {
      a: 10,
      b: 'big'
    };
    var url = http.makeUrl('http://localhost/test', params);
    url.should.equal('http://localhost/test?a=10&b=big');
  });
});
