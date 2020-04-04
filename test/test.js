var getTiles = require('../');

var startChrome = require("start-chrome");
var assert = require('assert');
var getRegionDelimitations = require('get-region-delimitations');

var example = require('../example.json');

describe('Test the function', function () {
    it('should get the right distance', function () {
        var borders = getRegionDelimitations(example)
        var arr = getTiles(borders, 14, 16, true, 0.1);
        log = false;
        if (log) {
            arr.forEach(function(val) {
                startChrome('https://a.tile.openstreetmap.org/' + [val.z, val.x, val.y].join('/') + '.png')
            });
            console.log(arr, arr.length)
        }
        assert.equal(true, Array.isArray(arr));
    });
    
});