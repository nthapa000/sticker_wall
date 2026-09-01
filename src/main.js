// Step 3: Wire store, controls, metrics, panels, and map
import { nightMarket } from './data/collections.js';
import { createStore } from './state/store.js';
import { renderMap } from './ui/map.js';
import { renderLegend } from './ui/legend.js';
import { attachControls } from './ui/controls.js';
import { attachMetrics } from './ui/metrics.js';
import { attachPanels } from './ui/panels.js';

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', async () => {
  // Create store with Night Market
  const store = createStore(JSON.parse(JSON.stringify(nightMarket)));

  const mapEl = document.getElementById('map');
  const legendEl = document.getElementById('legend');

  // Set collection name
  document.getElementById('collection-name').textContent = nightMarket.theme;

  // Attach UI components
  attachControls(store);
  attachMetrics(store);
  attachPanels(store, nightMarket.stickers, nightMarket.centres);
  renderLegend(legendEl);

  // Render map on store change
  const updateMap = () => {
    const snapshot = store.currentSnapshot;
    if (snapshot) {
      renderMap(mapEl, nightMarket.stickers, snapshot, true);
    }
  };

  store.subscribe(updateMap);
  updateMap();
});
