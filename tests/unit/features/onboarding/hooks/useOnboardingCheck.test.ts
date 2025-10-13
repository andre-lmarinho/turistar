import { renderHook, waitFor } from '@testing-library/react';
import { useOnboardingCheck } from '@/features/planner/hooks/modules/useOnboardingCheck';

beforeEach(() => {
  localStorage.clear();
});

test('shows onboarding when not previously seen', async () => {
  const { result } = renderHook(() => useOnboardingCheck('plan1'));
  await waitFor(() => expect(result.current.showOnboarding).toBe(true));
  expect(localStorage.getItem('planner-onboarding-shown-plan1')).toBe('true');
});

test('does not show onboarding if already seen', async () => {
  localStorage.setItem('planner-onboarding-shown-plan2', 'true');
  const { result } = renderHook(() => useOnboardingCheck('plan2'));
  await waitFor(() => expect(result.current.showOnboarding).toBe(false));
});
