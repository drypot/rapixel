var should = require('should');

var l = require('../main/l.js');

describe("find", function () {
	it("should success", function () {
		var item = l.find([ 1, 2, 3], function (item) {
			return item === 2;
		});
		item.should.equal(2);
	});
	it("should success", function () {
		var item = l.find([ 1, 2, 3], function (item) {
			return item === 4;
		});
		should(item === null);
	});
});

describe("merge", function () {
	function eq(item1, item2) {
		return item1.name === item2.name;
	}
	it("should success", function () {
		var obj1 = [];
		var obj2 = [{ name: 'n1'}];
		l.merge(obj1, obj2, eq);
		obj1.should.length(1);
		obj1[0].name.should.equal('n1');
	});
	it("should success", function () {
		var obj1 = [{ name: 'n1'}, { name: 'n2'}];
		var obj2 = [{ name: 'n2'}, { name: 'n3'}, { name: 'n4'}];
		l.merge(obj1, obj2, eq);
		obj1.should.length(4);
		obj1[0].name.should.equal('n1');
		obj1[1].name.should.equal('n2');
		obj1[2].name.should.equal('n3');
		obj1[3].name.should.equal('n4');
	});
});
