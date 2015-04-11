var expect = require('../base/chai').expect;

var utilp = require('../base/util');

describe('find', function () {
  it('should success', function () {
    var item = utilp.find([ 1, 2, 3], function (item) {
      return item === 2;
    });
    expect(item).equal(2);
  });
  it('should success', function () {
    var item = utilp.find([ 1, 2, 3], function (item) {
      return item === 4;
    });
    expect(item).null;
  });
});

describe('mergeObject', function () {
  it('should success', function () {
    var obj1 = { a: 1 };
    var obj2 = { b: 2 };
    utilp.mergeObject(obj1, obj2);
    expect(obj1).eql({ a: 1, b: 2 });
  });
  it('should success', function () {
    var obj1 = { };
    var obj2 = { a: 1 };
    var obj3 = { b: 2 };
    utilp.mergeObject(obj1, obj2, obj3);
    expect(obj1).eql({ a: 1, b: 2 });
  });
});

describe('mergeArray', function () {
  function eq(item1, item2) {
    return item1.name === item2.name;
  }
  it('should success', function () {
    var obj1 = [];
    var obj2 = [{ name: 'n1', value: 'v1' }];
    utilp.mergeArray(obj1, obj2, eq);
    expect(obj1).length(1);
    expect(obj1[0].name).equal('n1');
    expect(obj1[0].value).equal('v1');
  });
  it('should success', function () {
    var obj1 = [{ name: 'n1', value: 'v1' }, { name: 'n2', value: 'v2' }];
    var obj2 = [{ name: 'n2', value: 'v2n' }, { name: 'n3', value: 'v3n' }, { name: 'n4', value: 'v4n' }];
    utilp.mergeArray(obj1, obj2, eq);
    expect(obj1).length(4);
    expect(obj1[0].name).equal('n1');
    expect(obj1[0].value).equal('v1');
    expect(obj1[1].name).equal('n2');
    expect(obj1[1].value).equal('v2n');
    expect(obj1[2].name).equal('n3');
    expect(obj1[2].value).equal('v3n');
    expect(obj1[3].name).equal('n4');
    expect(obj1[3].value).equal('v4n');
  });
});

describe('pass', function () {
  it('should success', function (done) {
    utilp.pass(function (err) {
      expect(err).not.exist;
      done();
    });
  });
  it('should success', function (done) {
    utilp.pass(1, 2, 3, function (err) {
      expect(err).not.exist;
      done();
    });
  });
});

describe('toDateTimeString', function () {
  it('should success', function () {
    var d = new Date(1974, 4, 16, 12, 0);
    expect(utilp.toDateTimeString(d)).equal('1974-05-16 12:00:00');
  })
});

describe('makeUrl', function () {
  it('should success', function () {
    var params = { a: 10 };
    var params2 = { a: 10, b: 'big'};
    expect(utilp.makeUrl('http://localhost/test')).equal('http://localhost/test');
    expect(utilp.makeUrl('http://localhost/test', params)).equal('http://localhost/test?a=10');
    expect(utilp.makeUrl('http://localhost/test', params2)).equal('http://localhost/test?a=10&b=big');
  });
});
