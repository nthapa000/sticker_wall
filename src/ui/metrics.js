// Metrics: display SSE, movements, iteration count

const round3 = (num) => Math.round(num * 1000) / 1000;

export const attachMetrics = (store) => {
  const statusText = document.getElementById('status-text');
  const iterationText = document.getElementById('iteration-text');
  const sseValue = document.getElementById('sse-value');
  const movementsValue = document.getElementById('movements-value');

  // Update on store change
  const updateMetrics = () => {
    const snapshot = store.currentSnapshot;
    if (!snapshot) {
      statusText.textContent = 'Invalid';
      iterationText.textContent = '';
      sseValue.textContent = '—';
      movementsValue.textContent = '—';
      return;
    }

    // Status and iteration
    const maxIt = 20;
    statusText.textContent = snapshot.status;
    iterationText.textContent = `iter ${snapshot.it}/${maxIt}`;

    // SSE (font-variant-numeric: tabular-nums)
    sseValue.textContent = round3(snapshot.sse).toFixed(3);

    // Movements: show max movement or "—" if none
    if (snapshot.moves.length === 0) {
      movementsValue.textContent = '—';
    } else {
      const maxMove = Math.max(...snapshot.moves);
      movementsValue.textContent = round3(maxMove).toFixed(3);
    }
  };

  store.subscribe(updateMetrics);
  updateMetrics();
};
