import { describe, it, expect } from 'vitest';
import { hasFirebaseConfig, loadFirebaseAuth } from './firebase';

describe('Firebase config absent (production default)', () => {
  it('hasFirebaseConfig is false when no VITE_FIREBASE env vars are set', () => {
    expect(hasFirebaseConfig).toBe(false);
  });

  it('loadFirebaseAuth resolves to undefined without importing the SDK', async () => {
    await expect(loadFirebaseAuth()).resolves.toBeUndefined();
  });
});