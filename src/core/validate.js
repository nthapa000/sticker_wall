// Validate a collection structure and coordinates
export const validate = (collection) => {
  const errors = [];

  // Check k matches centre count
  if (collection.k !== collection.centres.length) {
    errors.push({
      code: 'k-mismatch',
      field: 'centres',
      item: null,
      message: `centre count (${collection.centres.length}) must equal k (${collection.k})`,
    });
  }

  // Check sticker coordinates in range and non-finite
  const stickerIds = new Set();
  for (const sticker of collection.stickers) {
    if (stickerIds.has(sticker.id)) {
      errors.push({
        code: 'duplicate-id',
        field: 'id',
        item: sticker.id,
        message: `duplicate sticker id: ${sticker.id}`,
      });
    }
    stickerIds.add(sticker.id);

    if (!Number.isFinite(sticker.w)) {
      errors.push({
        code: 'non-finite',
        field: 'w',
        item: sticker.id,
        message: `non-finite coordinate in sticker ${sticker.id}: warmth`,
      });
    }
    if (!Number.isFinite(sticker.s)) {
      errors.push({
        code: 'non-finite',
        field: 's',
        item: sticker.id,
        message: `non-finite coordinate in sticker ${sticker.id}: sparkle`,
      });
    }

    if (sticker.w < 0 || sticker.w > 10) {
      errors.push({
        code: 'range',
        field: 'w',
        item: sticker.id,
        message: `coordinate outside 0–10: sticker ${sticker.id} warmth = ${sticker.w}`,
      });
    }
    if (sticker.s < 0 || sticker.s > 10) {
      errors.push({
        code: 'range',
        field: 's',
        item: sticker.id,
        message: `coordinate outside 0–10: sticker ${sticker.id} sparkle = ${sticker.s}`,
      });
    }
  }

  // Check centre coordinates in range and non-finite
  for (const centre of collection.centres) {
    if (!Number.isFinite(centre.w)) {
      errors.push({
        code: 'non-finite',
        field: 'w',
        item: centre.id,
        message: `non-finite coordinate in centre ${centre.id}: warmth`,
      });
    }
    if (!Number.isFinite(centre.s)) {
      errors.push({
        code: 'non-finite',
        field: 's',
        item: centre.id,
        message: `non-finite coordinate in centre ${centre.id}: sparkle`,
      });
    }

    if (centre.w < 0 || centre.w > 10) {
      errors.push({
        code: 'range',
        field: 'w',
        item: centre.id,
        message: `coordinate outside 0–10: centre ${centre.id} warmth = ${centre.w}`,
      });
    }
    if (centre.s < 0 || centre.s > 10) {
      errors.push({
        code: 'range',
        field: 's',
        item: centre.id,
        message: `coordinate outside 0–10: centre ${centre.id} sparkle = ${centre.s}`,
      });
    }
  }

  return {
    ok: errors.length === 0,
    errors,
  };
};
