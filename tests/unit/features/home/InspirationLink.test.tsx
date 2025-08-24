// tests/unit/features/home/InspirationLink.test.tsx

import React from 'react';
import { render, screen } from '@testing-library/react';

import InspirationLink from '@/features/home/components/InspirationLink';
import rome from '@/data/rome.json';
import paris from '@/data/paris.json';
import boipeba from '@/data/boipeba.json';

describe('InspirationLink', () => {
  it('renders destinations as links with correct hrefs', () => {
    render(<InspirationLink />);

    expect(
      screen.getByRole('link', { name: new RegExp(rome.title_inspiration, 'i') })
    ).toHaveAttribute('href', '/inspiration/rome');
    expect(
      screen.getByRole('link', { name: new RegExp(paris.title_inspiration, 'i') })
    ).toHaveAttribute('href', '/inspiration/paris');
    expect(
      screen.getByRole('link', { name: new RegExp(boipeba.title_inspiration, 'i') })
    ).toHaveAttribute('href', '/inspiration/boipeba');
  });
});
