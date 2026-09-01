// Expected Night Market run - independently recorded, never imported by src/
// This is the test fixture, not the application data

export const expectedMainRun = [
  // Iteration 1: RUNNING, SSE 41.750
  {
    it: 1,
    status: 'RUNNING',
    sse: 41.75,
    assign: [0, 0, 0, 1, 1, 1, 2, 2, 2, 2], // indices into centres array
    sig: 'frost,frost,frost,neon,neon,neon,ember,ember,ember,ember',
    ties: [
      { stickerId: 'mask', centreIds: ['frost', 'neon'] },
    ],
    empties: [],
    before: [
      { id: 'frost', w: 2, s: 2 },
      { id: 'neon', w: 2, s: 8 },
      { id: 'ember', w: 8, s: 4 },
    ],
    centres: [
      { id: 'frost', w: 0.6666666666666666, s: 2.6666666666666665 },
      { id: 'neon', w: 3, s: 8.333333333333334 },
      { id: 'ember', w: 8.25, s: 4.5 },
    ],
    moves: [1.4907119849998602, 1.054093025840308, 0.5590169943749474],
  },
  // Iteration 2: RUNNING, SSE 34.750
  {
    it: 2,
    status: 'RUNNING',
    sse: 34.75,
    assign: [0, 0, 0, 1, 1, 1, 1, 2, 2, 2], // lantern moved to neon (index 1)
    sig: 'frost,frost,frost,neon,neon,neon,neon,ember,ember,ember',
    ties: [],
    empties: [],
    before: [
      { id: 'frost', w: 0.6666666666666666, s: 2.6666666666666665 },
      { id: 'neon', w: 3, s: 8.333333333333334 },
      { id: 'ember', w: 8.25, s: 4.5 },
    ],
    centres: [
      { id: 'frost', w: 0.6666666666666666, s: 2.6666666666666665 },
      { id: 'neon', w: 3.75, s: 8 },
      { id: 'ember', w: 9, s: 3.6666666666666665 },
    ],
    moves: [0, 0.8208007989400887, 1.1212111636606778],
  },
  // Iteration 3: CONVERGED, SSE 34.750
  {
    it: 3,
    status: 'CONVERGED',
    sse: 34.75,
    assign: [0, 0, 0, 1, 1, 1, 1, 2, 2, 2],
    sig: 'frost,frost,frost,neon,neon,neon,neon,ember,ember,ember',
    ties: [],
    empties: [],
    before: [
      { id: 'frost', w: 0.6666666666666666, s: 2.6666666666666665 },
      { id: 'neon', w: 3.75, s: 8 },
      { id: 'ember', w: 9, s: 3.6666666666666665 },
    ],
    centres: [
      { id: 'frost', w: 0.6666666666666666, s: 2.6666666666666665 },
      { id: 'neon', w: 3.75, s: 8 },
      { id: 'ember', w: 9, s: 3.6666666666666665 },
    ],
    moves: [0, 0, 0],
  },
];
