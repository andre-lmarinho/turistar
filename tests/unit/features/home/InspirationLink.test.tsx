// tests/unit/features/home/InspirationLink.test.tsx

import React from 'react';
import { render, screen } from '@testing-library/react';

import InspirationLink from '@/features/home/components/InspirationLink';
import boipeba from '@/data/boipeba.json';

describe('InspirationLink', () => {
  it('includes Boipeba in the destinations', () => {
    render(<InspirationLink />);

    expect(screen.getByText(boipeba.title_inspiration)).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });
});
