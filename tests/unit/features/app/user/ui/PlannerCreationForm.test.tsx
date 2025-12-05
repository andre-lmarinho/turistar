import React from 'react';
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, beforeEach, expect, vi } from 'vitest';

import type { AutocompletePlace } from '@/features/app/planner/types/locations';
import { PlannerCreationForm } from '@/features/app/user/ui/PlannerCreationForm';
import type { CreatePlannerPlanResult } from '@/features/app/planner/server/createPlan';

const pushMock = vi.fn();
const refreshMock = vi.fn();
const saveEditToken = vi.fn();
const createPlanFn = vi.fn();
const onPlanCreated = vi.fn();

const { triggerLocationChange, LocationSearchInput } = vi.hoisted(() => {
  let handleChange: (value: string | AutocompletePlace) => void = () => {};
  return {
    LocationSearchInput: (props: { value: string; onChange: (value: string | AutocompletePlace) => void; placeholder: string }) => {
      handleChange = props.onChange;
      return (
        <input
          aria-label="destination-input"
          placeholder={props.placeholder}
          value={props.value}
          onChange={(event) => props.onChange(event.target.value)}
        />
      );
    },
    triggerLocationChange: (value: string | AutocompletePlace) => {
      handleChange(value);
    },
  };
});

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, refresh: refreshMock }),
}));

vi.mock('@/shared/ui/calendar', () => ({
  DateRangePicker: () => <div data-testid="range-picker" />,
}));

vi.mock('@/shared/ui/loading', () => ({
  LoadingScreen: ({ text }: { text?: string }) => <div data-testid="loading">{text}</div>,
}));

vi.mock('@/features/app/planner/components/ui/LocationSearchInput', () => ({
  LocationSearchInput,
}));

vi.mock('@/features/app/planner/hooks/search/useDestinationAutocomplete', () => ({
  useDestinationAutocomplete: vi.fn(),
}));

vi.mock('@/features/app/planner/hooks/data/usePlanEditTokens', () => ({
  usePlanEditTokens: () => ({ saveEditToken }),
}));

describe('PlannerCreationForm', () => {
  beforeEach(() => {
    pushMock.mockReset();
    refreshMock.mockReset();
    saveEditToken.mockReset();
    createPlanFn.mockReset();
    onPlanCreated.mockReset();
  });

  it('shows an error when destination is missing', async () => {
    render(<PlannerCreationForm createPlanFn={createPlanFn} persistEditTokens={false} />);

    fireEvent.click(screen.getByRole('button', { name: /start your planning/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Please choose a destination.');
    expect(createPlanFn).not.toHaveBeenCalled();
  });

  it('creates a plan, saves tokens, and navigates with coords when successful', async () => {
    const result: CreatePlannerPlanResult = {
      planId: 'plan-1',
      publicSlug: 'slug-1',
      editToken: 'token-1',
      recentPlan: { id: 'plan-1', slug: 'slug-1', dest: 'Tokyo', start: '2024-01-01', end: '2024-01-08' },
    };
    createPlanFn.mockResolvedValue(result);

    render(<PlannerCreationForm createPlanFn={createPlanFn} />);
    await act(async () => {
      triggerLocationChange({
        name: 'Tokyo, Japan',
        latitude: -10,
        longitude: 20,
        countryCode: 'JP',
      });
    });
    await waitFor(() =>
      expect(screen.getByPlaceholderText('Destination')).toHaveValue('Tokyo, Japan')
    );

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /start your planning/i }));
    });

    await waitFor(() => expect(createPlanFn).toHaveBeenCalled());
    expect(saveEditToken).toHaveBeenCalledWith('plan-1', 'token-1');
    expect(pushMock).toHaveBeenCalledTimes(1);
    const uri = pushMock.mock.calls[0][0];
    expect(uri).toContain('/p/slug-1?');
    const [, query = ''] = uri.split('?');
    const params = new URLSearchParams(query);
    expect(params.get('dest')).toBe('Tokyo');
    expect(params.get('start')).toBe('2024-01-01');
    expect(params.get('end')).toBe('2024-01-08');
    expect(params.get('lat')).toBe('-10');
    expect(params.get('lng')).toBe('20');
  });

  it('shows a failure message when plan creation rejects', async () => {
    createPlanFn.mockRejectedValueOnce(new Error('boom'));

    render(<PlannerCreationForm createPlanFn={createPlanFn} />);
    await act(async () => {
      triggerLocationChange('City');
    });
    await waitFor(() =>
      expect(screen.getByPlaceholderText('Destination')).toHaveValue('City')
    );

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /start your planning/i }));
    });

    expect(await screen.findByRole('alert')).toHaveTextContent('Failed to create plan.');
    expect(screen.getByRole('button', { name: /start your planning/i })).not.toBeDisabled();
  });

  it('calls onPlanCreated instead of pushing when provided', async () => {
    const result: CreatePlannerPlanResult = {
      planId: 'plan-2',
      publicSlug: 'slug-2',
      editToken: 'token-2',
      recentPlan: { id: 'plan-2', slug: 'slug-2', dest: 'Rome', start: '2024-02-01', end: '2024-02-05' },
    };
    createPlanFn.mockResolvedValue(result);

    render(<PlannerCreationForm createPlanFn={createPlanFn} onPlanCreated={onPlanCreated} />);
    await act(async () => {
      triggerLocationChange({
        name: 'Rome',
        latitude: 0,
        longitude: 0,
        country: 'IT',
      });
    });
    await waitFor(() => expect(screen.getByPlaceholderText('Destination')).toHaveValue('Rome'));

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /start your planning/i }));
    });

    await waitFor(() => expect(onPlanCreated).toHaveBeenCalledWith(result));
    expect(pushMock).not.toHaveBeenCalled();
    expect(screen.getByPlaceholderText('Destination')).toHaveValue('');
  });
});
