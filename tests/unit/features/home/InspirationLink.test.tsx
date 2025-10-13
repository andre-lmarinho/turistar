import React from 'react';
import { render, screen } from '@testing-library/react';

import InspirationLink from '@/features/home/components/InspirationLink';
import romeJson from '@/features/inspiration/data/rome.json';
import parisJson from '@/features/inspiration/data/paris.json';
import boipebaJson from '@/features/inspiration/data/boipeba.json';

const rome = romeJson as { title_inspiration: string };
const paris = parisJson as { title_inspiration: string };
const boipeba = boipebaJson as { title_inspiration: string };

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
