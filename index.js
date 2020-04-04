
var pointInPolygon = require('point-in-polygon');
var extent = require('geojson-bbox');
var clipper = require('greiner-hormann');
var buffer = require('turf-buffer');

module.exports = function (borders, minZoom, maxZoom, onlyCorners, tileBuffer) {
    var result = [];
    var poly = {
        type: 'Feature',
        geometry: {
            type: 'LineString',
            coordinates: createSquare(borders)
        }
    };
    var zooms = Array.apply(null, Array(maxZoom - minZoom + 1))
        .map(function (x, i) { return minZoom + i })
    zooms.forEach(function (z) {
        var dist = (256 * tileBuffer) * (256/180)/Math.pow(2,z)
        poly = buffer(poly, dist, 'degrees').geometry
        var bbox = limitBounds(extent(poly))
        var top = lat2tile(bbox[3], z)
        var left = long2tile(bbox[0], z)
        var bottom = lat2tile(bbox[1], z)
        var right = long2tile(bbox[2], z)
        for (var x = left; x <= right; x++) {
            for (var y = top; y <= bottom; y++) {
                //get tile corners and center
                var cornersWithCenter = tileCornersWithCenter(z, x, y)
                var anyPointIn = cornersWithCenter
                    .some(function (pt) {
                        return pointInPolygon(pt, poly.coordinates[0])
                    })
                if (anyPointIn) {
                    r = [z, x, y].join('/') + '.png'
                    result.push(r)
                }
                if (!anyPointIn && !onlyCorners) {
                    // if tile covers polygon (like river) points would not be inside
                    // but intersects with polygon
                    var int = clipper.intersection(
                        poly.coordinates[0].slice(0, -1),
                        cornersWithCenter.slice(0, cornersWithCenter.length - 1)) //remove ctr
                    if (int) {
                        r = [z, x, y].join('/') + '.png'
                        result.push(r)
                    }
                }
            }
        }
    })
    //console.log(result)
    return result;
}


function createSquare(borders) {
    var a1 = borders[0].latitude
    var a2 = borders[0].longitude
    var b1 = borders[1].latitude
    var b2 = borders[1].longitude
    return [[a2, a1], [b2, a1], [a2, b1], [b2, b1]];
}


// get tile corner points and center
function tileCornersWithCenter(z, x, y) {
    var top = tile2lat(y, z)
    var left = tile2long(x, z)
    var bottom = tile2lat(y + 1, z)
    var right = tile2long(x + 1, z)
    return [
        [left, bottom],
        [right, bottom],
        [right, top],
        [left, top],
        [(left + right) / 2, (bottom + top) / 2]
    ]
}

// get tile numbers for lat, long and vice versa 
// http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames 
// http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#ECMAScript_.28JavaScript.2FActionScript.2C_etc..29 (javascript code)
function long2tile(lon, zoom) { return (Math.floor((lon + 180) / 360 * Math.pow(2, zoom))); }
function lat2tile(lat, zoom) { return (Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom))); }
function tile2long(x, z) {
    return (x / Math.pow(2, z) * 360 - 180);
}
function tile2lat(y, z) {
    var n = Math.PI - 2 * Math.PI * y / Math.pow(2, z);
    return (180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));
}
//////

function limitBounds(bbox) {
    return [
        bbox[0] > -180 ? bbox[0] : -180 + 0.000001,
        bbox[1] > -85.0511 ? bbox[1] : -85.0511 + 0.000001,
        bbox[2] < 180 ? bbox[2] : 180 - 0.000001,
        bbox[3] < 85.0511 ? bbox[3] : 85.0511 - 0.000001
    ]
}
