// Panel cards: display centre membership and empty panel reason

const round3 = (num) => Math.round(num * 1000) / 1000;

export const attachPanels = (store, stickers, centres) => {
  const panelCardsEl = document.getElementById('panel-cards');

  // Update on store change
  const updatePanels = () => {
    const snapshot = store.currentSnapshot;
    if (!snapshot) {
      panelCardsEl.innerHTML = '';
      return;
    }

    panelCardsEl.innerHTML = '';

    // Build panel membership from assignments
    const panelMembers = Array(centres.length).fill(null).map(() => []);
    for (let i = 0; i < stickers.length; i++) {
      const centreIdx = snapshot.assign[i];
      panelMembers[centreIdx].push(stickers[i].id);
    }

    // Render cards for each centre
    for (let i = 0; i < centres.length; i++) {
      const centre = centres[i];
      const members = panelMembers[i];
      const isEmpty = snapshot.empties.includes(centre.id);

      const card = document.createElement('div');
      card.className = `panel-card ${centre.id}`;

      const titleDiv = document.createElement('div');
      titleDiv.style.fontWeight = 'bold';
      titleDiv.style.marginBottom = 'var(--sp-1)';
      titleDiv.textContent = `${centre.label} (${members.length})`;

      card.appendChild(titleDiv);

      if (isEmpty) {
        const reason = document.createElement('div');
        reason.style.fontSize = 'var(--fs-xs)';
        reason.style.color = 'var(--ink-2)';
        reason.style.fontStyle = 'italic';
        reason.textContent = 'Centre retained (empty panel)';
        card.appendChild(reason);
      } else if (members.length > 0) {
        const membersList = document.createElement('div');
        membersList.style.fontSize = 'var(--fs-xs)';
        membersList.textContent = members.join(', ');
        card.appendChild(membersList);
      }

      // Show movement if not iteration 0
      if (snapshot.it > 0) {
        const move = snapshot.moves[i];
        const moveDiv = document.createElement('div');
        moveDiv.style.fontSize = 'var(--fs-xs)';
        moveDiv.style.color = 'var(--ink-2)';
        moveDiv.style.marginTop = 'var(--sp-1)';
        moveDiv.textContent = `movement: ${round3(move).toFixed(3)}`;
        card.appendChild(moveDiv);
      }

      panelCardsEl.appendChild(card);
    }
  };

  store.subscribe(updatePanels);
  updatePanels();
};
