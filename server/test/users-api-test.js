var should = require('should');
var request = require('superagent').agent();
var bcrypt = require('bcrypt');

var init = require('../main/init');
var config = require('../main/config')({ test: true });
var mongo = require('../main/mongo')({ dropDatabase: true });
var express = require('../main/express');
var error = require('../main/error');
var test = require('../main/test')({ request: request });

require('../main/users-api');

before(function (next) {
	init.run(next);
});

before(function () {
	express.listen();
});

describe("creating", function () {
	beforeEach(function (next) {
		mongo.users.remove(next);
	});
	it("should fail when name empty", function (next) {
		var form = { name: '', email: 'abc@def.com', password: '1234' };
		request.post(test.url + '/api/users').send(form).end(function (err,res) {
			should(!res.error);
			should(res.body.err);
			res.body.err.rc.should.equal(error.INVALID_DATA);
			res.body.err.fields[0].name.should.equal('name');
			res.body.err.fields[0].msg.should.equal(error.msg.NAME_EMPTY);
			next();
		});
	});
	it("should fail when name short", function (next) {
		var form = { name: 'a', email: 'abc@def.com', password: '1234' };
		request.post(test.url + '/api/users').send(form).end(function (err,res) {
			should(res.body.err);
			res.body.err.rc.should.equal(error.INVALID_DATA);
			res.body.err.fields[0].name.should.equal('name');
			res.body.err.fields[0].msg.should.equal(error.msg.NAME_RANGE);
			next();
		});
	});
	it("should success when name length 2", function (next) {
		var form = { name: 'ab', email: 'abc@def.com', password: '1234' };
		request.post(test.url + '/api/users').send(form).end(function (err,res) {
			should(!res.body.err);
			next();
		});
	});
	it("should fail when name long", function (next) {
		var form = { name: '123456789012345678901234567890123', email: 'abc@def.com', password: '1234' };
		request.post(test.url + '/api/users').send(form).end(function (err,res) {
			should(res.body.err);
			res.body.err.rc.should.equal(error.INVALID_DATA);
			res.body.err.fields[0].name.should.equal('name');
			res.body.err.fields[0].msg.should.equal(error.msg.NAME_RANGE);
			next();
		});
	});
	it("should success when name length 32", function (next) {
		var form = { name: '12345678901234567890123456789012', email: 'abc@def.com', password: '1234' };
		request.post(test.url + '/api/users').send(form).end(function (err,res) {
			should(!res.body.err);
			next();
		});
	});
	it("should fail when email invalid", function (next) {
		var form = { name: 'abcd', email: 'abc.def.com', password: '1234' };
		request.post(test.url + '/api/users').send(form).end(function (err,res) {
			should(res.body.err);
			res.body.err.rc.should.equal(error.INVALID_DATA);
			res.body.err.fields[0].name.should.equal('email');
			res.body.err.fields[0].msg.should.equal(error.msg.EMAIL_PATTERN);
			next();
		});
	});
	it("should fail when password short", function (next) {
		var form = { name: 'abcd', email: 'abc@def.com', password: '123' };
		request.post(test.url + '/api/users').send(form).end(function (err,res) {
			should(res.body.err);
			res.body.err.rc.should.equal(error.INVALID_DATA);
			res.body.err.fields[0].name.should.equal('password');
			res.body.err.fields[0].msg.should.equal(error.msg.PASSWORD_RANGE);
			next();
		});
	});
	it("should fail when password long", function (next) {
		var form = { name: 'abcd', email: 'abc@def.com', password: '123456789012345678901234567890123' };
		request.post(test.url + '/api/users').send(form).end(function (err,res) {
			should(res.body.err);
			res.body.err.rc.should.equal(error.INVALID_DATA);
			res.body.err.fields[0].name.should.equal('password');
			res.body.err.fields[0].msg.should.equal(error.msg.PASSWORD_RANGE);
			next();
		});
	});
	it("should success when password 32", function (next) {
		var form = { name: 'abcd', email: 'abc@def.com', password: '12345678901234567890123456789012' };
		request.post(test.url + '/api/users').send(form).end(function (err,res) {
			should(!res.body.err);
			next();
		});
	});
});

describe("creating dupe", function () {
	it("given snowman", function (next) {
		var form = { name: 'snowman', email: 'snowman@def.com', password: '1234' };
		request.post(test.url + '/api/users').send(form).end(function (err,res) {
			should(!res.body.err);
			next();
		});
	});
	it("should fail when creating snowman again", function (next) {
		var form = { name: 'snowman', email: 'snowman@xyz.com', password: '1234' };
		request.post(test.url + '/api/users').send(form).end(function (err,res) {
			should(res.body.err);
			res.body.err.rc.should.equal(error.INVALID_DATA);
			res.body.err.fields[0].name.should.equal('name');
			res.body.err.fields[0].msg.should.equal(error.msg.NAME_DUPE);
			next();
		});
	});
	it("should fail when creating snowman@def.com again", function (next) {
		var form = { name: 'snowboy', email: 'snowman@def.com', password: '1234' };
		request.post(test.url + '/api/users').send(form).end(function (err,res) {
			should(res.body.err);
			res.body.err.rc.should.equal(error.INVALID_DATA);
			res.body.err.fields[0].name.should.equal('email');
			res.body.err.fields[0].msg.should.equal(error.msg.EMAIL_DUPE);
			next();
		});
	});

});

describe("confirm creating", function () {
	before(function (next) {
		mongo.users.remove(next);
	});
	it("given snowman", function (next) {
		var form = { name: 'snowman', email: 'snowman@def.com', password: '1234' };
		request.post(test.url + '/api/users').send(form).end(function (err,res) {
			should(!res.body.err);
			next();
		});
	});
	it("given snowboy", function (next) {
		var form = { name: 'snowboy', email: 'snowboy@def.com', password: '1234' };
		request.post(test.url + '/api/users').send(form).end(function (err,res) {
			should(!res.body.err);
			next();
		});
	});
	it("given snowgirl", function (next) {
		var form = { name: 'snowgirl', email: 'snowgirl@def.com', password: '1234' };
		request.post(test.url + '/api/users').send(form).end(function (err,res) {
			should(!res.body.err);
			next();
		});
	});
	it("should success", function (next) {
		mongo.findUserByEmail('snowman@def.com', function (err, user) {
			should(!err);
			user.name.should.equal('snowman');
			bcrypt.compareSync('1234', user.hash).should.true;
			next();
		})
	});
	it("should success", function (next) {
		mongo.findUserByName('snowman', function (err, user) {
			should(!err);
			user.name.should.equal('snowman');
			bcrypt.compareSync('4444', user.hash).should.false;
			next();
		})
	});
});