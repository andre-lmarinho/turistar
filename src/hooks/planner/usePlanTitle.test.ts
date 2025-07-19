import { renderHook, act, waitFor } from '@testing-library/react';
import { usePlanTitle } from './usePlanTitle';

beforeEach(() => {
  localStorage.clear();
});

describe('usePlanTitle', () => {
  it('loads value from localStorage', async () => {
    localStorage.setItem('title-plan1', JSON.stringify('Stored'));
    const { result } = renderHook(() => usePlanTitle('plan1', 'Default'));
    await waitFor(() => expect(result.current.title).toBe('Stored'));
  });

  it('saves value to localStorage on change', async () => {
    const { result } = renderHook(() => usePlanTitle('plan2', 'Default'));
    act(() => {
      result.current.setTitle('Custom');
    });
    await waitFor(() => expect(localStorage.getItem('title-plan2')).toBe(JSON.stringify('Custom')));
  });
});
