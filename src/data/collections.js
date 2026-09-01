// Frozen literal collection fixtures - source order matters for all

export const nightMarket = {
  id: 'night-market',
  theme: 'Night Market',
  k: 3,
  stickers: [
    { id: 'moon', label: 'crescent moon', glyph: '🌙', w: 1, s: 2 },
    { id: 'snowflake', label: 'snowflake', glyph: '❄️', w: 0, s: 1 },
    { id: 'mask', label: 'performing arts', glyph: '🎭', w: 1, s: 5 },
    { id: 'sparkler', label: 'sparkles', glyph: '✨', w: 1, s: 9 },
    { id: 'rocket', label: 'rocket', glyph: '🚀', w: 3, s: 9 },
    { id: 'balloon', label: 'balloon', glyph: '🎈', w: 5, s: 7 },
    { id: 'lantern', label: 'paper lantern', glyph: '🏮', w: 6, s: 7 },
    { id: 'chilli', label: 'hot pepper', glyph: '🌶️', w: 9, s: 4 },
    { id: 'campfire', label: 'fire', glyph: '🔥', w: 8, s: 2 },
    { id: 'sun', label: 'sun', glyph: '☀️', w: 10, s: 5 },
  ],
  centres: [
    { id: 'frost', label: 'Frost Lane', w: 2, s: 2 },
    { id: 'neon', label: 'Neon Alley', w: 2, s: 8 },
    { id: 'ember', label: 'Ember Row', w: 8, s: 4 },
  ],
};

export const quietCorner = {
  id: 'quiet-corner',
  theme: 'Quiet Corner',
  k: 2,
  stickers: [
    { id: 'pebble', label: 'pebble', glyph: '⚪', w: 0, s: 0 },
    { id: 'leaf', label: 'leaf', glyph: '🍃', w: 2, s: 1 },
    { id: 'mist', label: 'mist', glyph: '💨', w: 1, s: 3 },
  ],
  centres: [
    { id: 'calm', label: 'calm', w: 1, s: 1 },
    { id: 'blaze', label: 'blaze', w: 9, s: 9 },
  ],
};

// Validation fixtures - injected faults
export const badRange = {
  id: 'bad-range',
  theme: 'Bad Range',
  k: 1,
  stickers: [
    { id: 'test', label: 'test', glyph: '🎯', w: 12, s: 5 }, // w out of range
  ],
  centres: [
    { id: 'centre1', label: 'centre1', w: 5, s: 5 },
  ],
};

export const badDuplicateId = {
  id: 'bad-duplicate-id',
  theme: 'Bad Duplicate ID',
  k: 1,
  stickers: [
    { id: 'dup', label: 'first', glyph: '🎯', w: 1, s: 1 },
    { id: 'dup', label: 'second', glyph: '🎯', w: 2, s: 2 }, // duplicate id
  ],
  centres: [
    { id: 'centre1', label: 'centre1', w: 5, s: 5 },
  ],
};

export const badK = {
  id: 'bad-k',
  theme: 'Bad K',
  k: 3,
  stickers: [
    { id: 'test', label: 'test', glyph: '🎯', w: 5, s: 5 },
  ],
  centres: [
    { id: 'centre1', label: 'centre1', w: 1, s: 1 },
    { id: 'centre2', label: 'centre2', w: 9, s: 9 }, // k=3 but only 2 centres
  ],
};

export const badNonfinite = {
  id: 'bad-nonfinite',
  theme: 'Bad Nonfinite',
  k: 1,
  stickers: [
    { id: 'test', label: 'test', glyph: '🎯', w: 5, s: NaN }, // non-finite
  ],
  centres: [
    { id: 'centre1', label: 'centre1', w: 5, s: 5 },
  ],
};
