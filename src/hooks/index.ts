// src/hooks/index.ts

// planner
export * from '@/features/planner/hooks/useActivityCardEditor';
export * from '@/features/planner/hooks/useTripRange';
export * from '@/features/planner/hooks/useActivitiesById';
export * from '@/features/planner/hooks/useActivityState';
export * from '@/features/planner/hooks/useDnDPlanner';
export * from '@/features/planner/hooks/useDragState';
export * from '@/features/planner/hooks/usePlanner';
export * from '@/features/planner/hooks/usePlanTitleSupabase';
export * from '@/features/planner/hooks/useSelectedActivity';
export * from '@/features/planner/hooks/usePlanParams';
export * from '@/features/planner/hooks/usePlanDaysSupabase';

// catalog
export * from '@/features/planner/hooks/catalog/useCatalog';
export * from '@/features/planner/hooks/catalog/useDestinationCatalog';
export * from '@/features/planner/hooks/catalog/useCatalogActivities';
export * from '@/features/planner/hooks/catalog/useDestinationAutocomplete';
export * from '@/features/planner/hooks/catalog/useGeoapifySearch';
export { fetchAutocomplete } from '@/features/planner/hooks/catalog/fetchAutocomplete';
export {
  fetchCatalog,
  type CatalogApiResponse,
} from '@/features/planner/hooks/catalog/fetchCatalog';
export { fetchSearch } from '@/features/planner/hooks/catalog/fetchSearch';

// budget
export * from '@/features/budget/hooks';

// onboarding
export * from '@/features/onboarding/hooks/useOnboardingCheck';

// ui
export * from '@/shared/hooks/ui/useCardPopups';
export * from '@/shared/hooks/ui/useEscapeKey';
export * from '@/shared/hooks/ui/useFlexibleRef';
export * from '@/shared/hooks/ui/useKeyBinds';
export * from '@/shared/hooks/ui/usePopupOutsideHandler';
export * from '@/shared/hooks/ui/useElementRect';
export * from '@/shared/hooks/ui/useCardColors';
export * from '@/shared/hooks/ui/useInputWidth';

// shared
export * from '@/shared/hooks/useDebounce';
