import { render } from '@testing-library/react';
import React, { useEffect } from 'react';
import { vi } from 'vitest';
import { useElementMeasure } from '@/features/app/planner/hooks/ui/useElementMeasure';

function TestHarness({ text, onMeasure }: { text: string; onMeasure: (width?: number) => void }) {
  const { ref, width } = useElementMeasure<HTMLInputElement>({ width: true, text });

  useEffect(() => {
    onMeasure(width);
  }, [width, onMeasure]);

  return (
    <input
      data-testid="measured-input"
      ref={ref}
      // Provide deterministic styles for the measurement calculation
      style={{ font: '16px Arial', paddingLeft: '2px', paddingRight: '2px', border: '1px solid' }}
    />
  );
}

describe('useElementMeasure', () => {
  test('recalculates width when `text` changes', async () => {
    // Mock canvas measurement to return width proportional to text length
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    const contextMock = {
      font: '',
      measureText: (t: string) => ({ width: t.length * 10 }),
    } as unknown as CanvasRenderingContext2D;
    // @ts-expect-error - mock return type narrowed for tests
    HTMLCanvasElement.prototype.getContext = vi.fn(() => contextMock);

    try {
      const calls: Array<number | undefined> = [];
      const onMeasure = (w?: number) => calls.push(w);

      const { rerender } = render(<TestHarness text="abc" onMeasure={onMeasure} />);

      // Allow layout effects to run
      await new Promise((r) => setTimeout(r, 0));

      // Trigger text change via rerender to recalc width
      rerender(<TestHarness text="abcdefgh" onMeasure={onMeasure} />);
      await new Promise((r) => setTimeout(r, 0));

      // We expect at least two measurements: initial and after text change
      expect(calls.length).toBeGreaterThanOrEqual(2);
      const initial = calls.at(0) ?? 0;
      const updated = calls.at(-1) ?? 0;

      expect(updated).toBeGreaterThan(initial);
    } finally {
      // Restore canvas context
      HTMLCanvasElement.prototype.getContext = originalGetContext;
    }
  });
});
