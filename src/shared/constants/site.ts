// src/shared/constants/site.ts
// Canonical public origin for absolute URLs and SEO metadata.
// Resolved at runtime via env and deployment context.
import { getPublicSiteUrl } from '@/shared/utils/url';

export const SITE_URL = getPublicSiteUrl();
