// Legend: shape + colour + label encoding for each panel

const legendData = [
  {
    id: 'frost',
    label: 'Frost Lane',
    color: 'var(--panel-1)',
    shape: 'circle',
    pattern: 'solid',
  },
  {
    id: 'neon',
    label: 'Neon Alley',
    color: 'var(--panel-2)',
    shape: 'square',
    pattern: 'dashed 4 2',
  },
  {
    id: 'ember',
    label: 'Ember Row',
    color: 'var(--panel-3)',
    shape: 'triangle',
    pattern: 'dotted 1 3',
  },
];

// Create SVG marker for legend
const createLegendMarker = (item) => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '16');
  svg.setAttribute('height', '16');
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.setAttribute('class', 'legend-marker');

  let shape;
  if (item.shape === 'circle') {
    shape = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    shape.setAttribute('cx', '8');
    shape.setAttribute('cy', '8');
    shape.setAttribute('r', '3');
  } else if (item.shape === 'square') {
    shape = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    shape.setAttribute('x', '5');
    shape.setAttribute('y', '5');
    shape.setAttribute('width', '6');
    shape.setAttribute('height', '6');
  } else if (item.shape === 'triangle') {
    shape = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    shape.setAttribute('d', 'M 8 4 L 12 11 L 4 11 Z');
  }

  shape.setAttribute('fill', item.color);
  svg.appendChild(shape);
  return svg;
};

// Render legend to DOM element
export const renderLegend = (legendEl) => {
  legendEl.innerHTML = '';

  for (const item of legendData) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'legend-item';

    const marker = createLegendMarker(item);
    itemDiv.appendChild(marker);

    const label = document.createElement('span');
    label.textContent = item.label;
    itemDiv.appendChild(label);

    legendEl.appendChild(itemDiv);
  }
};
