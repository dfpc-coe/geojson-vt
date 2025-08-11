import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import {geoJSONToTile} from '../src/index.js';

const square = [{
    geometry: [[[4160, -64], [4160, 4160], [-64, 4160], [-64, -64], [4160, -64]]],
    type: 3,
    tags: {name: 'Pennsylvania', density: 284.3},
    id: '42'
}];

test('geoJSONToTile: converts all geometries to a single vector tile', () => {
    const geojson = getJSON('single-tile.json');
    const tile = geoJSONToTile(geojson, 12, 1171, 1566);

    assert.equal(tile.features.length, 1, 'z12-1171-1577');
    assert.equal(tile.features[0].tags.name, 'P Street Northwest - Massachusetts Avenue Northwest');
});

test('geoJSONToTile: clips geometries outside the tile', () => {
    const geojson = getJSON('us-states.json');

    const tile1 = geoJSONToTile(geojson, 7, 37, 48, {}, false, true);
    assert.deepEqual(tile1.features, getJSON('us-states-z7-37-48.json'), 'z7-37-48');

    const tile2 = geoJSONToTile(geojson, 9, 148, 192, {}, false, true);
    assert.deepEqual(tile2.features, square, 'z9-148-192 (clipped square)');

    assert.equal(geoJSONToTile(geojson, 11, 800, 400, {}, false, true), null, 'non-existing tile');
    assert.equal(geoJSONToTile(geojson, -5, 123.25, 400.25, {}, false, true), null, 'invalid tile');
    assert.equal(geoJSONToTile(geojson, 25, 200, 200, {}, false, true), null, 'invalid tile');
});

function getJSON(name) {
    return JSON.parse(fs.readFileSync(new URL(`./fixtures/${name}`, import.meta.url)));
}
