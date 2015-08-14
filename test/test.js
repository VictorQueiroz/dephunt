var _				= require('lodash');
var assert	= require('assert');
var dephunt = require('../src/dephunt');

describe('dephunt', function () {
	it('should read bower file', function () {
		var vendorFiles = dephunt('./bower.json');

		assert.ok(_.isArray(vendorFiles));
		assert.equal(3, vendorFiles.length);
	});

	it('should auto detect bower file', function () {
		var vendorFiles = dephunt();

		assert.ok(_.isArray(vendorFiles));
		assert.equal(3, vendorFiles.length);
	});
});