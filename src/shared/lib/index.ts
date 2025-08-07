// src/shared/lib/index.ts

export {
  GEOAPIFY_CATEGORIES,
  getGeoapifyKey,
  mapGeoapifyFeature,
  fetchGeoapifyAutocomplete,
  fetchGeoapifyCatalog,
  fetchGeoapifySearch,
} from './geoapify';
export { fetchJson } from './http';
export { supabase } from './supabaseClient';
export { clientEnv } from './clientEnv';
export type { ClientEnv } from './clientEnv';
