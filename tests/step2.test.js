import test from 'node:test';
import assert from 'node:assert';
import { JSDOM } from 'jsdom';
import { nightMarket } from '../src/data/collections.js';
import { renderMap } from '../src/ui/map.js';
import { renderLegend } from '../src/ui/legend.js';

// Create DOM for testing
const createTestDOM = () => {
  const dom = new JSDOM(`
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          :root {
            --panel-1: #0072B2;
            --panel-2: #E69F00;
            --panel-3: #009E73;
            --ink: #111418;
            --ink-2: #4A5560;
            --line: #D7DDE3;
          }
        </style>
      </head>
      <body>
        <svg id="map" viewBox="0 0 100 100"></svg>
        <div id="legend"></div>
      </body>
    </html>
  `);
  return dom.window;
};

// Initial snapshot
const createSnapshot0 = (collection) => ({
  it: 0,
  assign: Array(collection.stickers.length).fill(0),
  sig: '',
  before: collection.centres.map(c => ({ id: c.id, w: c.w, s: c.s })),
  centres: collection.centres.map(c => ({ id: c.id, w: c.w, s: c.s })),
  moves: Array(collection.centres.length).fill(0),
  empties: [],
  ties: [],
  sse: 0,
  status: 'READY',
});

test('Step 2: Render Night Market snapshot0 and verify marker count', async () => {
  const window = createTestDOM();
  const document = window.document;

  // Make document available globally for UI modules
  globalThis.document = document;
  globalThis.window = window;

  const mapEl = document.getElementById('map');

  const snapshot = createSnapshot0(nightMarket);
  renderMap(mapEl, nightMarket.stickers, snapshot);

  // Count sticker markers
  const stickerMarkers = mapEl.querySelectorAll('.sticker-marker');
  assert.strictEqual(stickerMarkers.length, 10, 'should have 10 sticker markers for Night Market');

  // Count centre markers (initial + current)
  const centreInitial = mapEl.querySelectorAll('.centre-initial');
  const centreCurrent = mapEl.querySelectorAll('.centre-current');
  assert.strictEqual(centreInitial.length, 3, 'should have 3 initial centre markers');
  assert.strictEqual(centreCurrent.length, 3, 'should have 3 current centre markers');

  // Verify gridlines (11 per axis, 0-10 inclusive)
  const gridLines = mapEl.querySelectorAll('.grid-line');
  assert.strictEqual(gridLines.length, 22, 'should have 22 gridlines (11 vertical + 11 horizontal)');

  // Verify axes
  const axisLines = mapEl.querySelectorAll('.axis-line');
  assert.strictEqual(axisLines.length, 2, 'should have 2 axes');
});

test('Step 2: Render legend with all three panels', async () => {
  const window = createTestDOM();
  const document = window.document;

  globalThis.document = document;
  globalThis.window = window;

  const legendEl = document.getElementById('legend');

  renderLegend(legendEl);

  const legendItems = legendEl.querySelectorAll('.legend-item');
  assert.strictEqual(legendItems.length, 3, 'should have 3 legend items (frost, neon, ember)');

  // Verify legend markers
  const markers = legendEl.querySelectorAll('.legend-marker');
  assert.strictEqual(markers.length, 3, 'should have 3 legend markers');
});

test('Step 2: SVG accessibility - sticker markers have role and aria-label', async () => {
  const window = createTestDOM();
  const document = window.document;

  globalThis.document = document;
  globalThis.window = window;

  const mapEl = document.getElementById('map');

  const snapshot = createSnapshot0(nightMarket);
  renderMap(mapEl, nightMarket.stickers, snapshot);

  const markers = mapEl.querySelectorAll('.sticker-marker');
  for (const marker of markers) {
    assert.strictEqual(marker.getAttribute('role'), 'button', 'markers should have role=button');
    assert.ok(marker.getAttribute('aria-label'), 'markers should have aria-label');
    assert.strictEqual(marker.getAttribute('tabindex'), '0', 'markers should be keyboard accessible');
  }
});

test('Step 2: Sticker coordinates map correctly to SVG positions', async () => {
  const window = createTestDOM();
  const document = window.document;

  globalThis.document = document;
  globalThis.window = window;

  const mapEl = document.getElementById('map');

  const snapshot = createSnapshot0(nightMarket);
  renderMap(mapEl, nightMarket.stickers, snapshot);

  // moon is at (1, 2) - should map to SVG (10, 80) with +2 text offset
  const moonMarker = mapEl.querySelector('#sticker-moon');
  const moonText = moonMarker.querySelector('.sticker-glyph');
  const x = parseFloat(moonText.getAttribute('x'));
  const y = parseFloat(moonText.getAttribute('y'));

  assert.strictEqual(x, 10, 'moon x coordinate should map to 10 (1 * 10)');
  assert.strictEqual(y, 82, 'moon y coordinate should map to 82 (100 - 2*10 + 2 offset)');
});
