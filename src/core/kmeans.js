import { sqDist, mean, movement } from './geometry.js';

const TOL = 1e-12;
const MAX_IT = 20;

// Single iteration: assign, update, measure, check convergence
export const iterate = (stickers, centres, prevSnapshot = null) => {
  const it = (prevSnapshot?.it ?? 0) + 1;
  const prevSig = prevSnapshot?.sig ?? null;

  // Step 1: Assign each sticker to nearest centre (unrounded squared distance)
  const assign = [];
  const ties = [];
  for (const sticker of stickers) {
    let minDist = Infinity;
    let winners = [];

    for (let i = 0; i < centres.length; i++) {
      const d = sqDist(sticker, centres[i]);
      if (d < minDist - TOL) {
        minDist = d;
        winners = [i];
      } else if (Math.abs(d - minDist) < TOL) {
        winners.push(i);
      }
    }

    // Source order breaks ties
    const winnerIdx = winners[0];
    assign.push(winnerIdx);

    // Record ties with multiple winners
    if (winners.length > 1) {
      ties.push({
        stickerId: sticker.id,
        centreIds: winners.map(i => centres[i].id),
      });
    }
  }

  // Step 2: Update each centre or mark as empty
  const before = centres.map(c => ({ id: c.id, w: c.w, s: c.s }));
  const updated = [];
  const empties = [];

  for (let i = 0; i < centres.length; i++) {
    const members = stickers.filter((_, idx) => assign[idx] === i);

    if (members.length === 0) {
      // Empty centre retains previous coordinates exactly
      updated.push({ id: centres[i].id, w: centres[i].w, s: centres[i].s });
      empties.push(centres[i].id);
    } else {
      // Update to arithmetic mean
      const m = mean(members);
      updated.push({ id: centres[i].id, w: m.w, s: m.s });
    }
  }

  // Step 3: Measure total squared error against updated centres
  let sse = 0;
  for (let i = 0; i < stickers.length; i++) {
    const centreIdx = assign[i];
    const d = sqDist(stickers[i], updated[centreIdx]);
    sse += d;
  }

  // Step 4: Check convergence
  const sig = assign.map(idx => centres[idx].id).join(',');
  let status = 'RUNNING';

  if (it === 1) {
    // Iteration 1 can never converge
    status = 'RUNNING';
  } else if (sig === prevSig) {
    // Signature matches previous iteration
    status = 'CONVERGED';
  } else if (it >= MAX_IT) {
    // Reached max iterations
    status = 'NOT_CONVERGED';
  }

  // Calculate movements
  const moves = updated.map((c, i) => movement(before[i], c));

  return {
    it,
    assign,
    sig,
    before,
    centres: updated,
    moves,
    empties,
    ties,
    sse,
    status,
  };
};
