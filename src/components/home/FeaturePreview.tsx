// src/components/FeaturePreview.tsx
'use client';

import Image from 'next/image';

interface FeaturePreviewProps {
  title: string;
  description: string;
  imgSrc: string;
}

export default function FeaturePreview({ title, description, imgSrc }: FeaturePreviewProps) {
  return (
    <div className="text-center space-y-4">
      <div className="rounded-lg overflow-hidden border mx-auto">
        <Image
          src={imgSrc}
          alt={title}
          width={600}
          height={400}
          className="w-full h-48 object-cover"
        />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}
