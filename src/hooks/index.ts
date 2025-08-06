// src/hooks/index.ts

// planner
export * from './planner/useActivityCardEditor';
export * from './planner/useTripRange';
export * from './planner/useActivitiesById';
export * from './planner/useActivityState';
export * from './planner/useDnDPlanner';
export * from './planner/useDragState';
export * from './planner/usePlanner';
export * from './planner/usePlanTitleSupabase';
export * from './planner/useSelectedActivity';
export * from './planner/usePlanParams';
export * from './planner/useActivityCardEditor';

// catalog
export * from './catalog/useCatalog';
export * from './catalog/useDestinationCatalog';
export * from './catalog/useCatalogActivities';
export * from './catalog/useDestinationAutocomplete';
export * from './catalog/useGeoapifySearch';

export { fetchAutocomplete } from './catalog/fetchAutocomplete';
export { fetchCatalog, type CatalogApiResponse } from './catalog/fetchCatalog';
export { fetchSearch } from './catalog/fetchSearch';

// budget
export * from './budget/useBudgetSupabase';

// onboarding
export * from './onboarding/useOnboardingCheck';

// ui
export * from './ui/useCardPopups';
export * from './ui/useEscapeKey';
export * from './ui/useFlexibleRef';
export * from './ui/useKeyBinds';
export * from './ui/usePopupOutsideHandler';
export * from './ui/useElementRect';
export * from './ui/useCardColors';
export * from './ui/useInputWidth';

// shared
export * from './useDebounce';
