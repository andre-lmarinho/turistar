import { render, screen } from '@testing-library/react';
import { SortableItem } from './SortableItem';

describe('SortableItem', () => {
  it('renders its children', () => {
    render(<ul><SortableItem id="x">Hello</SortableItem></ul>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
