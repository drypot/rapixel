var tokenize = require('../base/util').tokenize;
var expect = require('../base/assert').expect;

describe('tokenizer', function () {
  it('can parse emtpy', function () {
    expect(tokenize('')).length(0);
  });
  it('can parse space', function () {
    expect(tokenize(' \t\n')).length(0);
  });
  it('can parse numbers', function () {
    expect(tokenize('1')).length(1).include('1');
    expect(tokenize('12')).length(1).include('12');
    expect(tokenize('123')).length(1).include('123');
    expect(tokenize('1 2')).length(2).include('1').include('2');
    expect(tokenize('12 345')).length(2).include('12').include('345');
  });
  it('can parse latins', function () {
    expect(tokenize('x')).length(1).include('x');
    expect(tokenize('x abc')).length(2).include('x').include('abc');
  });
  it('can skip latin dupes', function () {
    expect(tokenize('abc def abc')).length(2).include('abc').include('def');
  });
  it('should ignore case', function () {
    expect(tokenize('abc AbC dEf')).length(2).include('abc').include('def');
  });
  it('can parse latins with numbers', function () {
    expect(tokenize('abc123')).length(1).include('abc123');
  });
  it('can parse punctuations', function () {
    expect(tokenize('abc!')).length(1).include('abc');
    expect(tokenize('hello, world.')).length(2).include('hello').include('world');
  });
  it('can parse stop words', function () {
    expect(tokenize('what a beautiful world it is!')).length(3).include('what').include('beautiful').include('world');
  });
  it('can parse multiple arguments', function () {
    expect(tokenize('abc 123', 'def 123')).length(3).include('abc').include('def').include('123')
  });
  it('can parse hangul', function () {
    expect(tokenize('한')).length(0);
    expect(tokenize('한글')).length(1).include('한글');
    expect(tokenize('한글나')).length(2).include('한글').include('글나');
    expect(tokenize('한글나라')).length(3).include('한글').include('글나').include('나라');
    expect(tokenize('누나하고 나하고')).length(3).include('누나').include('나하').include('하고');
  });

});
