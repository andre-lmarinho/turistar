import { formatDayPlan } from './formatDayPlan';
import { parseISO } from 'date-fns';

describe('formatDayPlan', () => {
  it('formats date into id and label', () => {
    const date = parseISO('2024-07-05T00:00:00Z');
    const result = formatDayPlan(date);

    expect(result).toEqual({ id: '2024-07-05', label: 'Fri, 05 Jul' });
  });
});
