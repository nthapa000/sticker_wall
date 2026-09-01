// Controls: Step, Run to End, Load Demo, Reset buttons with store integration

export const attachControls = (store) => {
  const stepBtn = document.getElementById('step-btn');
  const runEndBtn = document.getElementById('run-end-btn');
  const resetBtn = document.getElementById('reset-btn');
  const loadDemoBtn = document.getElementById('load-demo-btn');

  // Step button: append one iterate
  stepBtn.addEventListener('click', () => {
    store.step();
  });

  // Run to End: loop step() until status leaves RUNNING
  runEndBtn.addEventListener('click', () => {
    store.runToEnd();
  });

  // Reset: restore original and clear history
  resetBtn.addEventListener('click', () => {
    if (confirm('Reset to original collection?')) {
      store.reset();
    }
  });

  // Load Demo: reload Night Market
  loadDemoBtn.addEventListener('click', async () => {
    const { nightMarket } = await import('../data/collections.js');
    store.collection = JSON.parse(JSON.stringify(nightMarket));
    store.originalCollection = JSON.parse(JSON.stringify(nightMarket));
    store.reset();
  });

  // Update button disabled states on store change
  const updateButtonStates = () => {
    const status = store.status;
    const canStep = status === 'READY' || status === 'RUNNING';
    const isSaving = status === 'CONVERGED';

    stepBtn.disabled = !canStep;
    runEndBtn.disabled = !canStep;
    document.getElementById('save-btn').disabled = !isSaving;
  };

  store.subscribe(updateButtonStates);
  updateButtonStates();
};
