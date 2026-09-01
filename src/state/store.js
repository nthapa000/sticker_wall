// Store: immutable history, cursor, selection, and observer pattern
import { iterate } from '../core/kmeans.js';
import { validate } from '../core/validate.js';

export class Store {
  constructor(collection) {
    this.collection = collection;
    this.originalCollection = JSON.parse(JSON.stringify(collection)); // deep copy
    this.validation = validate(collection);
    this.history = [];
    this.cursor = -1;
    this.selectedStickerId = null;
    this.subscribers = [];

    // Initialize with snapshot0 if valid
    if (this.validation.ok) {
      this.history.push(this.createSnapshot0());
      this.cursor = 0;
    }

    // Notify initial state to subscribers after construction
    this.notify();
  }

  // Create initial snapshot (iteration 0)
  createSnapshot0() {
    return {
      it: 0,
      assign: Array(this.collection.stickers.length).fill(0),
      sig: '',
      before: this.collection.centres.map(c => ({ id: c.id, w: c.w, s: c.s })),
      centres: this.collection.centres.map(c => ({ id: c.id, w: c.w, s: c.s })),
      moves: Array(this.collection.centres.length).fill(0),
      empties: [],
      ties: [],
      sse: 0,
      status: 'READY',
    };
  }

  // Get current snapshot
  get currentSnapshot() {
    if (this.cursor < 0 || this.cursor >= this.history.length) return null;
    return this.history[this.cursor];
  }

  // Get current status
  get status() {
    return this.currentSnapshot?.status ?? 'INVALID';
  }

  // Get all snapshots
  get snapshots() {
    return [...this.history];
  }

  // Single step: append one iterate snapshot if status allows it
  step() {
    const snapshot = this.currentSnapshot;
    if (!snapshot || (snapshot.status !== 'RUNNING' && snapshot.status !== 'READY')) {
      this.notify();
      return;
    }

    const prev = snapshot.it === 0 ? null : snapshot;
    const next = iterate(this.collection.stickers, snapshot.centres, prev);
    this.history.push(next);
    this.cursor = this.history.length - 1;
    this.notify();
  }

  // Run until convergence or NOT_CONVERGED
  runToEnd() {
    while (this.currentSnapshot?.status === 'RUNNING' || this.currentSnapshot?.status === 'READY') {
      this.step();
      if (this.currentSnapshot?.status === 'CONVERGED' || this.currentSnapshot?.status === 'NOT_CONVERGED') {
        break;
      }
    }
  }

  // Reset to original collection
  reset() {
    this.collection = JSON.parse(JSON.stringify(this.originalCollection));
    this.validation = validate(this.collection);
    this.history = [];
    this.cursor = -1;
    this.selectedStickerId = null;

    if (this.validation.ok) {
      this.history.push(this.createSnapshot0());
      this.cursor = 0;
    }
    this.notify();
  }

  // Edit a sticker coordinate and restart from original centres
  editSticker(stickerId, field, value) {
    const sticker = this.collection.stickers.find(s => s.id === stickerId);
    if (!sticker) return false;

    sticker[field] = value;

    // Re-validate after edit
    this.validation = validate(this.collection);

    if (!this.validation.ok) {
      // Revert on validation failure
      this.collection = JSON.parse(JSON.stringify(this.originalCollection));
      this.validation = validate(this.collection);
    }

    // Clear history and restart
    this.history = [];
    this.cursor = -1;
    if (this.validation.ok) {
      this.history.push(this.createSnapshot0());
      this.cursor = 0;
    }
    this.notify();

    return this.validation.ok;
  }

  // Set selected sticker
  selectSticker(stickerId) {
    this.selectedStickerId = stickerId;
    this.notify();
  }

  // Subscribe to changes
  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  // Notify all subscribers
  notify() {
    this.subscribers.forEach(cb => cb(this));
  }
}

// Create store from collection
export const createStore = (collection) => new Store(collection);
