import React from 'react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot, type Root } from 'react-dom/client';
import { render, screen, act, fireEvent } from '@testing-library/react';

import { DesktopActions } from '@/features/website/ui/layout/Navbar/components/DesktopActions';
import { useRecentPlan } from '@/features/planner/hooks/data/useRecentPlan';

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

describe('Resume planning actions', () => {
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
    const serverHtml = renderToString(<DesktopActions />);
    globalThis.window = originalWindow;

    document.body.innerHTML = `<div id="root">${serverHtml}</div>`;
    const container = document.getElementById('root')!;

    window.localStorage.setItem('recent_plan', JSON.stringify(plan));

    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    let root: Root;
    await act(() => {
      root = hydrateRoot(container, <DesktopActions />);
      expect(serverHtml).not.toContain('Continue Planning');
      expect(container.innerHTML).toBe(serverHtml);
    });

    expect(await screen.findByRole('link', { name: 'Continue Planning' })).toHaveAttribute(
      'href',
      '/planner/trip?dest=Paris&start=2023-01-01&end=2023-01-02'
    );

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
        <button type="button" onClick={() => saveRecentPlan(plan)}>
          Save plan
        </button>
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
