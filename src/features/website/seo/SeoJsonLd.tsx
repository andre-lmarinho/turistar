"use client";

import { HeadManagerContext } from "next/dist/shared/lib/head-manager-context.shared-runtime";
import Script from "next/script";
import { useContext } from "react";
import { SITE_URL } from "@/shared/utils/siteUrl";

const logoUrl = `${SITE_URL}/favicon.ico`;

export default function SeoJsonLd() {
  const { nonce } = useContext(HeadManagerContext);
  const org = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Turistar",
    url: SITE_URL,
    logo: logoUrl,
  } as const;

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Turistar",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  } as const;

  return (
    <>
      <Script
        id="ld-org"
        type="application/ld+json"
        nonce={nonce}
        /* biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD script payload */
        dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }}
      />
      <Script
        id="ld-website"
        type="application/ld+json"
        nonce={nonce}
        /* biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD script payload */
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
    </>
  );
}
