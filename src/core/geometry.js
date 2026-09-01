// Squared Euclidean distance between two points
export const sqDist = (p1, p2) => {
  const dx = p1.w - p2.w;
  const dy = p1.s - p2.s;
  return dx * dx + dy * dy;
};

// Arithmetic mean of points
export const mean = (points) => {
  if (points.length === 0) return null;
  const sumW = points.reduce((acc, p) => acc + p.w, 0);
  const sumS = points.reduce((acc, p) => acc + p.s, 0);
  return {
    w: sumW / points.length,
    s: sumS / points.length,
  };
};

// Euclidean distance between two points (for movement calculation)
export const movement = (before, after) => {
  const dx = before.w - after.w;
  const dy = before.s - after.s;
  return Math.sqrt(dx * dx + dy * dy);
};

// Round to 3 decimals, used only in UI layer
export const round3 = (num) => Math.round(num * 1000) / 1000;
