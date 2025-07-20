// src/components/home/FeaturePreview.tsx
'use client';

import React, { useId } from 'react';
import Image from 'next/image';

interface FeaturePreviewProps {
  title: string;
  description: string;
  imgSrc: string;
}

export default function FeaturePreview({ title, description, imgSrc }: FeaturePreviewProps) {
  const titleId = useId();

  return (
    <figure
      role="group"
      aria-labelledby={titleId}
      className="text-center space-y-4 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
    >
      <div className="rounded-lg overflow-hidden border mx-auto">
        {/* Image */}
        <Image
          src={imgSrc}
          alt={title}
          width={600}
          height={400}
          loading="lazy"
          className="w-full h-48 object-cover"
        />
      </div>
      {/* Heading & Description */}
      <figcaption>
        <h3 id={titleId} className="text-lg font-semibold">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </figcaption>
    </figure>
  );
}
