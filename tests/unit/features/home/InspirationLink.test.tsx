import React from 'react';
import { render, screen } from '@testing-library/react';

import { InspirationLink } from '@/features/website/components/InspirationLink';
import romeJson from '@/features/planner/inspiration/data/rome.json';
import boipebaJson from '@/features/planner/inspiration/data/boipeba.json';

const rome = romeJson as { title_inspiration: string };
const boipeba = boipebaJson as { title_inspiration: string };

describe('InspirationLink', () => {
  it('renders destinations as links with correct hrefs', () => {
    render(<InspirationLink />);

    expect(
      screen.getByRole('link', { name: new RegExp(rome.title_inspiration, 'i') })
    ).toHaveAttribute('href', '/inspiration/rome');

    expect(
      screen.getByRole('link', { name: new RegExp(boipeba.title_inspiration, 'i') })
    ).toHaveAttribute('href', '/inspiration/boipeba');

    expect(screen.getAllByRole('link')).toHaveLength(2);
  });
});
