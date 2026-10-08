import { notifyCollectionUpdated } from './plant-ops';
import { vi } from 'vitest';

describe('notifyCollectionUpdated', () => {
  it('dispatches a collection refresh event', () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

    notifyCollectionUpdated();

    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    expect(dispatchSpy.mock.calls[0][0].type).toBe('plant-collection-updated');
  });
});
