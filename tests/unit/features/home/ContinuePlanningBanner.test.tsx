import React from 'react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot, type Root } from 'react-dom/client';
import { render, screen, act, fireEvent } from '@testing-library/react';

import ContinuePlanningBanner from '@/features/home/components/ContinuePlanningBanner';
import { useRecentPlan } from '@/features/planner/contracts/marketing/useRecentPlan';
import { Button } from '@/shared/ui/button';

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...rest
  }: { href: string; children: React.ReactNode } & Record<string, unknown>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe('ContinuePlanningBanner hydration', () => {
  afterEach(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.clear();
    }
    document.body.innerHTML = '';
  });

  it('hydrates without warnings and loads banner after effect', async () => {
    const plan = {
      id: '1',
      slug: 'trip',
      dest: 'Paris',
      start: '2023-01-01',
      end: '2023-01-02',
    };

    const originalWindow = globalThis.window;
    // @ts-ignore simulate server environment
    globalThis.window = undefined;
    const serverHtml = renderToString(<ContinuePlanningBanner />);
    globalThis.window = originalWindow;

    document.body.innerHTML = `<div id="root">${serverHtml}</div>`;
    const container = document.getElementById('root')!;

    window.localStorage.setItem('recent_plan', JSON.stringify(plan));

    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    let root: Root;
    await act(() => {
      root = hydrateRoot(container, <ContinuePlanningBanner />);
      expect(serverHtml).not.toContain('Continue your');
      expect(container.innerHTML).toBe(serverHtml);
    });

    expect(await screen.findByText(/Continue your 2 days trip to Paris/)).toBeInTheDocument();

    expect(consoleError).not.toHaveBeenCalled();

    consoleError.mockRestore();
    act(() => root.unmount());
  });

  it('saves the recent plan to localStorage immediately', () => {
    const plan = {
      id: '2',
      slug: 'immediate',
      dest: 'Lisbon',
      start: '2023-02-01',
      end: '2023-02-05',
    };

    function SaveRecentPlanButton() {
      const { saveRecentPlan } = useRecentPlan();

      return (
        <Button type="button" onClick={() => saveRecentPlan(plan)}>
          Save plan
        </Button>
      );
    }

    const { unmount } = render(<SaveRecentPlanButton />);

    expect(window.localStorage.getItem('recent_plan')).toBe(JSON.stringify(null));

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Save plan' }));
      unmount();
    });

    expect(window.localStorage.getItem('recent_plan')).toBe(JSON.stringify(plan));
  });
});
