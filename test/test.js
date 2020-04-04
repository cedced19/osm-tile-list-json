var getTiles = require('../');

var assert = require('assert');
var getRegionDelimitations = require('get-region-delimitations');

var example = require('../example.json');

describe('Test the function', function () {
    it('should get the right distance', function () {
        var borders = getRegionDelimitations(example)
        var arr = getTiles(borders, 14, 16, true, 0.1);
        assert.equal(true, Array.isArray(arr));
    });
    
});