import React from 'react';
import { render, screen } from '@testing-library/react';

import { InspirationLink } from '@/features/website/sections/InspirationLink';
import boipeba from '@/features/app/planner/modules/inspiration/data/boipeba.json';
import rome from '@/features/app/planner/modules/inspiration/data/rome.json';
import type { InspirationDocument } from '@/features/app/planner/modules/inspiration/server/types';

describe('InspirationLink', () => {
  it('renders destinations as links with correct hrefs', () => {
    render(<InspirationLink />);

    const romeTitle = (rome as InspirationDocument).title_inspiration ?? '';
    const boipebaTitle = (boipeba as InspirationDocument).title_inspiration ?? '';

    expect(
      screen.getByRole('link', {
        name: new RegExp(romeTitle, 'i'),
      })
    ).toHaveAttribute('href', '/inspiration/rome');

    expect(
      screen.getByRole('link', {
        name: new RegExp(boipebaTitle, 'i'),
      })
    ).toHaveAttribute('href', '/inspiration/boipeba');

    expect(screen.getAllByRole('link')).toHaveLength(2);
  });
});
