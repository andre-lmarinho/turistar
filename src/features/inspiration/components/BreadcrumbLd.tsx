// src/features/inspiration/components/BreadcrumbLd.tsx
import Script from 'next/script';

import { capitalize } from '@/shared/utils';
import { SITE_URL } from '@/shared/constants/site';

type BreadcrumbLdProps = {
  city: string;
  pageUrl: string;
};

export function BreadcrumbLd({ city, pageUrl }: BreadcrumbLdProps) {
  const cityName = capitalize(city);

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: `${cityName} Inspiration`,
        item: pageUrl,
      },
    ],
  } as const;

  const attraction = {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: cityName,
    url: pageUrl,
  } as const;

  return (
    <>
      <Script
        id="ld-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <Script
        id="ld-attraction"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(attraction) }}
      />
    </>
  );
}

export default BreadcrumbLd;
