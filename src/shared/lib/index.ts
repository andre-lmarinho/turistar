// src/shared/lib/index.ts

export {
  GEOAPIFY_CATEGORIES,
  getGeoapifyKey,
  mapGeoapifyFeature,
  fetchGeoapifyAutocomplete,
  fetchGeoapifyCatalog,
  fetchGeoapifySearch,
} from './geoapify';
export {
  fetchWikimediaImage,
  fetchWikimediaSignals,
  enrichWithWikimediaSignals,
  withPageviews,
} from './wikimedia';
export { computeCatalogScore } from './ranking';
export { fetchJson } from './http';
export { pLimit } from './pLimit';
export { supabase } from './supabaseClient';
export { clientEnv } from './clientEnv';
export type { ClientEnv } from './clientEnv';
export { usePlanEditTokens } from './planEditToken';
export { useRecentPlan } from '../hooks/useRecentPlan';
