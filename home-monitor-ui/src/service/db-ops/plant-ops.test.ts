import { afterEach, vi } from 'vitest';
import { getSummaryStats, getUserCollection, notifyCollectionUpdated } from './plant-ops';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('notifyCollectionUpdated', () => {
  it('dispatches a collection refresh event', () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

    notifyCollectionUpdated();

    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    expect(dispatchSpy.mock.calls[0][0].type).toBe('plant-collection-updated');
  });
});

describe('API response handling', () => {
  it('rejects a failed collection response instead of returning its error body', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({ error: 'Failed to fetch plants' }),
    }));

    await expect(getUserCollection()).rejects.toThrow(
      'API request failed (500): Failed to fetch plants',
    );
  });

  it('rejects a non-array collection response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ status: 'ok' }),
    }));

    await expect(getUserCollection()).rejects.toThrow(
      'API returned an invalid plant collection',
    );
  });

  it('rejects a failed summary response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({ error: 'Failed to fetch summary stats' }),
    }));

    await expect(getSummaryStats()).rejects.toThrow(
      'API request failed (500): Failed to fetch summary stats',
    );
  });
});
