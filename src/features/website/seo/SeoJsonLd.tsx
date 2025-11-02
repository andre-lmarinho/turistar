import { headers } from 'next/headers';
import { SITE_URL } from '@/shared/utils/siteUrl';
const logoUrl = `${SITE_URL}/favicon.ico`;

export default function SeoJsonLd() {
  // Middleware injects a per-request nonce via the `x-nonce` header to satisfy our CSP.
  // Fall back to `undefined` so React omits the attribute when no nonce is present
  // (e.g. during local development where CSP is relaxed).
  const nonce = headers().get('x-nonce') ?? undefined;
  const org = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Turistar',
    url: SITE_URL,
    logo: logoUrl,
  } as const;

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Turistar',
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  } as const;

  return (
    <>
      <script
        id="ld-org"
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }}
      />
      <script
        id="ld-website"
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
    </>
  );
}
