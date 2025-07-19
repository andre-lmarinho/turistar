import { renderHook, act } from '@testing-library/react';
import { useBudget } from './useBudget';

beforeEach(() => {
  localStorage.clear();
});

describe('useBudget', () => {
  test('adds a new entry and resets fields', () => {
    const { result } = renderHook(() => useBudget('plan1', 0));

    act(() => {
      result.current.setDesc('Taxi');
      result.current.setCat('transport');
      result.current.setAmount(50);
    });

    act(() => {
      result.current.handleAdd();
    });

    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0]).toMatchObject({
      description: 'Taxi',
      category: 'transport',
      amount: 50,
    });
    expect(result.current.desc).toBe('');
    expect(result.current.amount).toBe(0);
  });

  test('updates an existing entry', () => {
    const { result } = renderHook(() => useBudget('plan1', 0));

    act(() => {
      result.current.setDesc('Hotel');
      result.current.setCat('lodging');
      result.current.setAmount(100);
      result.current.handleAdd();
    });

    act(() => {
      result.current.handleUpdateEntry(0, {
        description: 'Hotel updated',
        category: 'lodging',
        amount: 120,
      });
    });

    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0]).toMatchObject({
      description: 'Hotel updated',
      category: 'lodging',
      amount: 120,
    });
  });

  test('deletes an entry', () => {
    const { result } = renderHook(() => useBudget('plan1', 0));

    act(() => {
      result.current.setDesc('Breakfast');
      result.current.setCat('food');
      result.current.setAmount(20);
    });

    act(() => {
      result.current.handleAdd();
    });

    act(() => {
      result.current.setDesc('Lunch');
      result.current.setCat('food');
      result.current.setAmount(30);
    });

    act(() => {
      result.current.handleAdd();
    });

    act(() => {
      result.current.handleDeleteEntry(0);
    });

    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0]).toMatchObject({
      description: 'Lunch',
      category: 'food',
      amount: 30,
    });
  });
});
