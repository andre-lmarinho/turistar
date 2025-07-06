import { render, screen } from '@testing-library/react';
import { SortableItem } from './SortableItem';

describe('SortableItem', () => {
  it('renders the activity title', () => {
    const activity = { id: 'x', title: 'Hello', color: 'red' };
    render(
      <ul>
        <SortableItem id="x" activity={activity} />
      </ul>
    );
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
