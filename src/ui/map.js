// SVG map visualization for the 2D warmth/sparkle plane
// viewBox "0 0 100 100" maps to warmth 0-10, sparkle 0-10

const SCALE = 10; // scale from data coordinates to SVG coordinates
const MARKER_RADIUS = 2;

// Build SVG namespace helper
const svg = (tag, attrs = {}, ...children) => {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  children.forEach(child => {
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else {
      el.appendChild(child);
    }
  });
  return el;
};

// Scale data coordinates to SVG
const scale = (w, s) => ({
  x: w * SCALE,
  y: 100 - s * SCALE, // flip y: SVG y increases downward, sparkle increases upward
});

// Render axes, gridlines, and labels
export const renderGrid = (mapEl) => {
  const defs = svg('defs');
  defs.appendChild(svg('style', {}, `
    .grid-line { stroke: var(--line); stroke-width: 0.5; }
    .axis-label { font-size: 8px; fill: var(--ink-2); text-anchor: middle; }
    .axis-line { stroke: var(--ink); stroke-width: 1; }
  `));
  mapEl.appendChild(defs);

  // Gridlines and labels
  for (let i = 0; i <= 10; i++) {
    const x = i * SCALE;
    const y = i * SCALE;
    // Vertical lines (warmth)
    mapEl.appendChild(svg('line', {
      class: 'grid-line',
      x1: x, y1: 0,
      x2: x, y2: 100,
    }));
    // Horizontal lines (sparkle)
    mapEl.appendChild(svg('line', {
      class: 'grid-line',
      x1: 0, y1: 100 - y,
      x2: 100, y2: 100 - y,
    }));
  }

  // Axes
  mapEl.appendChild(svg('line', {
    class: 'axis-line',
    x1: 0, y1: 100,
    x2: 100, y2: 100,
  })); // warmth axis
  mapEl.appendChild(svg('line', {
    class: 'axis-line',
    x1: 0, y1: 0,
    x2: 0, y2: 100,
  })); // sparkle axis

  // Labels
  mapEl.appendChild(svg('text', {
    class: 'axis-label',
    x: 50, y: 105,
  }, 'Warmth'));
  mapEl.appendChild(svg('text', {
    class: 'axis-label',
    x: -5, y: 50,
    transform: 'rotate(-90 -5 50)',
  }, 'Sparkle'));
};

// Render sticker markers
export const renderStickers = (mapEl, stickers, assign, centres) => {
  const group = svg('g', { id: 'stickers' });

  for (let i = 0; i < stickers.length; i++) {
    const sticker = stickers[i];
    const centreIdx = assign[i];
    const centre = centres[centreIdx];
    const panelId = centre.id;
    const pos = scale(sticker.w, sticker.s);

    // Sticker marker group
    const markerGroup = svg('g', {
      class: `sticker-marker ${panelId}`,
      id: `sticker-${sticker.id}`,
      'data-sticker-id': sticker.id,
      'data-centre-id': centre.id,
      tabindex: 0,
      role: 'button',
      'aria-label': `${sticker.id} at (${sticker.w}, ${sticker.s}) in ${centre.label}`,
    });

    // Marker shape (per-panel)
    const markerShape = createMarkerShape(panelId, pos);
    markerGroup.appendChild(markerShape);

    // Glyph text
    markerGroup.appendChild(svg('text', {
      x: pos.x, y: pos.y + 2,
      'text-anchor': 'middle',
      'dominant-baseline': 'middle',
      'font-size': 4,
      class: 'sticker-glyph',
    }, sticker.glyph));

    // ID label
    markerGroup.appendChild(svg('text', {
      x: pos.x, y: pos.y - 4,
      'text-anchor': 'middle',
      'font-size': 2,
      fill: 'var(--ink-2)',
      class: 'sticker-label',
    }, sticker.id));

    group.appendChild(markerGroup);
  }

  mapEl.appendChild(group);
};

// Create marker shape based on panel (circle, square, triangle)
const createMarkerShape = (panelId, pos) => {
  const r = MARKER_RADIUS;
  const color = getPanelColor(panelId);

  if (panelId === 'frost') {
    // Circle for frost
    return svg('circle', {
      cx: pos.x, cy: pos.y, r,
      fill: color,
      class: 'shape',
    });
  } else if (panelId === 'neon') {
    // Square for neon
    return svg('rect', {
      x: pos.x - r, y: pos.y - r, width: r * 2, height: r * 2,
      fill: color,
      class: 'shape',
    });
  } else {
    // Triangle for ember (path)
    return svg('path', {
      d: `M ${pos.x} ${pos.y - r} L ${pos.x + r} ${pos.y + r} L ${pos.x - r} ${pos.y + r} Z`,
      fill: color,
      class: 'shape',
    });
  }
};

// Render centre markers (initial and current)
export const renderCentres = (mapEl, beforeCentres, afterCentres) => {
  const group = svg('g', { id: 'centres' });

  for (let i = 0; i < afterCentres.length; i++) {
    const before = beforeCentres[i];
    const after = afterCentres[i];
    const bPos = scale(before.w, before.s);
    const aPos = scale(after.w, after.s);
    const color = getPanelColor(after.id);

    // Drift connector (faint line from before to after)
    if (before.w !== after.w || before.s !== after.s) {
      group.appendChild(svg('line', {
        x1: bPos.x, y1: bPos.y,
        x2: aPos.x, y2: aPos.y,
        stroke: color,
        'stroke-width': 0.5,
        'stroke-dasharray': '2,2',
        opacity: 0.3,
        class: 'drift-connector',
      }));
    }

    // Initial centre (hollow ring, dashed stroke)
    group.appendChild(svg('circle', {
      cx: bPos.x, cy: bPos.y, r: 3,
      fill: 'none',
      stroke: color,
      'stroke-width': 0.5,
      'stroke-dasharray': '2,2',
      class: `centre-initial ${after.id}`,
      'data-centre-id': after.id,
    }));

    // Current centre (filled with crosshair)
    const crosshairGroup = svg('g', {
      class: `centre-current ${after.id}`,
      'data-centre-id': after.id,
    });
    crosshairGroup.appendChild(svg('circle', {
      cx: aPos.x, cy: aPos.y, r: 2,
      fill: color,
      class: 'centre-marker',
    }));
    // Crosshair lines
    crosshairGroup.appendChild(svg('line', {
      x1: aPos.x - 2.5, y1: aPos.y,
      x2: aPos.x + 2.5, y2: aPos.y,
      stroke: color,
      'stroke-width': 0.3,
    }));
    crosshairGroup.appendChild(svg('line', {
      x1: aPos.x, y1: aPos.y - 2.5,
      x2: aPos.x, y2: aPos.y + 2.5,
      stroke: color,
      'stroke-width': 0.3,
    }));
    group.appendChild(crosshairGroup);
  }

  mapEl.appendChild(group);
};

// Get panel colour by ID
const getPanelColor = (centreId) => {
  if (centreId === 'frost') return 'var(--panel-1)';
  if (centreId === 'neon') return 'var(--panel-2)';
  if (centreId === 'ember') return 'var(--panel-3)';
  return '#999'; // unassigned/fallback
};

// Clear and redraw entire map
export const renderMap = (mapEl, stickers, snapshot) => {
  mapEl.innerHTML = '';
  renderGrid(mapEl);
  renderStickers(mapEl, stickers, snapshot.assign, snapshot.centres);
  renderCentres(mapEl, snapshot.before, snapshot.centres);
};
