// Step 2: Wire HTML shell to Night Market demo
import { nightMarket } from './data/collections.js';
import { renderMap } from './ui/map.js';
import { renderLegend } from './ui/legend.js';

// Create initial snapshot (iteration 0)
const createSnapshot0 = (collection) => ({
  it: 0,
  assign: Array(collection.stickers.length).fill(0), // all unassigned initially
  sig: '',
  before: collection.centres.map(c => ({ id: c.id, w: c.w, s: c.s })),
  centres: collection.centres.map(c => ({ id: c.id, w: c.w, s: c.s })),
  moves: Array(collection.centres.length).fill(0),
  empties: [],
  ties: [],
  sse: 0,
  status: 'READY',
});

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const mapEl = document.getElementById('map');
  const legendEl = document.getElementById('legend');

  // Load demo
  const snapshot = createSnapshot0(nightMarket);

  // Render map and legend
  renderMap(mapEl, nightMarket.stickers, snapshot);
  renderLegend(legendEl);

  // Set collection name
  document.getElementById('collection-name').textContent = nightMarket.theme;

  // Set status
  document.getElementById('status-text').textContent = 'Ready';
});
