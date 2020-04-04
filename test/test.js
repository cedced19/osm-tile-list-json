var getTiles = require('../');

var startChrome = require("start-chrome");
var assert = require('assert');
var getRegionDelimitations = require('get-region-delimitations');

var example = require('../example.json');

describe('Test the function', function () {
    it('should get the right distance', function () {
        var borders = getRegionDelimitations(example)
        var arr = getTiles(borders, 12, 14, false, 0.1);
        /*
        arr.forEach(function(val) {
            startChrome('https://a.tile.openstreetmap.org/' + val)
        });
        */
        assert.equal(true, Array.isArray(arr));
    });
    
});