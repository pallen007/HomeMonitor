import { notifyCollectionUpdated } from './plant-ops';

describe('notifyCollectionUpdated', () => {
  it('dispatches a collection refresh event', () => {
    const dispatchSpy = jest.spyOn(window, 'dispatchEvent');

    notifyCollectionUpdated();

    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    expect(dispatchSpy.mock.calls[0][0].type).toBe('plant-collection-updated');
  });
});
