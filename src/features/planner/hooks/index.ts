// src/features/planner/hooks/index.ts

export { useActivityCardEditor } from './useActivityCardEditor';
export { useTripRange } from './useTripRange';
export { useActivitiesById } from './useActivitiesById';
export { useActivityState } from './useActivityState';
export { useDnDPlanner } from './useDnDPlanner';
export { useDragState } from './useDragState';
export { usePlanner } from './usePlanner';
export { usePlanTitle } from './usePlanTitleSupabase';
export { useSelectedActivity } from './useSelectedActivity';
export { usePlanParams } from './usePlanParams';
export { usePlanDays } from './usePlanDaysSupabase';

export {
  useCatalog,
  useDestinationCatalog,
  useCatalogActivities,
  useDestinationAutocomplete,
  useGeoapifySearch,
  fetchAutocomplete,
  fetchCatalog,
  fetchSearch,
  type CatalogApiResponse,
} from './catalog';

export { PlannerProvider, usePlannerContext } from './PlannerContext';
